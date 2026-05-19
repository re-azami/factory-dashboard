import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ChatEvent } from '../../pages/chat/models/chat-event';
import { ChatService, LOCAL_STORAGE_MODE_KEY, STREAM_ERROR_MESSAGE } from './chat.service';
import { LoadingService } from './loading.service';

/**
 * Unit tests for ChatService.
 *
 * Two areas of behavior:
 *   1. Mode persistence (localStorage + BehaviorSubject) — mirrors AppService.colorMode patterns.
 *   2. NDJSON streaming via window.fetch() + ReadableStream parsing, with LoadingService bracket
 *      and AbortController teardown.
 *
 * All tests stub `window.fetch` so no real network traffic occurs. The stream body is built
 * from a JS-defined ReadableStream that emits Uint8Array chunks; this exercises the same
 * `getReader()`/`read()` loop the service uses in production.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: missing localStorage key, empty-body stream,
 *                                  malformed JSON line silently dropped.
 *  2. Boundary values            — covered: single chunk, multi-line chunk, partial-line chunk
 *                                  carries over to next; trailing blank line ignored.
 *  3. Persian / Unicode text     — covered: NDJSON content with Persian text preserved verbatim;
 *                                  STREAM_ERROR_MESSAGE is the exact Persian string.
 *  4. Duplicate rows             — N/A: streaming layer is event-by-event; duplicate handling
 *                                  is a chat.component concern (covered in its spec).
 *  5. Null DB columns            — N/A: streaming layer treats the JSON payload as a string; the
 *                                  cell-level rendering is exercised in chat-tool-card.spec.ts.
 *  6. Calendar conversion        — N/A: no date logic in this service.
 *  7. Permission denials         — covered as a proxy via the non-200 response branch (auth
 *                                  proper lands in AUTH-003+).
 *  8. LLM provider switches      — covered: all four ChatEvent types are exercised (text /
 *                                  tool_start / tool_end / error), matching both Anthropic and
 *                                  OpenAI-compatible providers via the unified NDJSON shape.
 */
describe('ChatService', () => {
    let service: ChatService;
    let loadingService: LoadingService;
    let loadingStartSpy: jasmine.Spy;
    let loadingStopSpy: jasmine.Spy;

    function clearStorage(): void {
        try {
            window.localStorage.removeItem(LOCAL_STORAGE_MODE_KEY);
        } catch {
            /* ignore — storage may be disabled in some environments */
        }
    }

    beforeEach(() => {
        clearStorage();
        // Fresh module per test so the BehaviorSubject re-reads localStorage on construction.
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({});
    });

    afterEach(() => {
        clearStorage();
    });

    function buildService(): void {
        service = TestBed.inject(ChatService);
        loadingService = TestBed.inject(LoadingService);
        loadingStartSpy = spyOn(loadingService, 'start').and.callThrough();
        loadingStopSpy = spyOn(loadingService, 'stop').and.callThrough();
    }

    // ── ReadableStream stub helpers ──────────────────────────────────────────

    function encode(s: string): Uint8Array {
        return new TextEncoder().encode(s);
    }

    /** Build a ReadableStream that yields the given Uint8Array chunks in order, then closes. */
    function streamFromChunks(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>({
            start(controller): void {
                for (const chunk of chunks) controller.enqueue(chunk);
                controller.close();
            },
        });
    }

    /** Build a 200-OK Response whose body is the supplied ReadableStream. */
    function okResponse(body: ReadableStream<Uint8Array>): Response {
        return new Response(body, { status: 200 });
    }

    /**
     * Collect a stream observable to completion. Returns a promise that resolves to
     * `{ events, errored }` once `complete` or `error` fires.
     */
    function collect(
        observable: ReturnType<ChatService['streamChat']>,
    ): { promise: Promise<{ events: ChatEvent[]; errored: boolean }>; subscription: Subscription } {
        const events: ChatEvent[] = [];
        let resolve!: (v: { events: ChatEvent[]; errored: boolean }) => void;
        const promise = new Promise<{ events: ChatEvent[]; errored: boolean }>((res) => {
            resolve = res;
        });
        const subscription = observable.subscribe({
            next: (e) => events.push(e),
            error: () => resolve({ events, errored: true }),
            complete: () => resolve({ events, errored: false }),
        });
        return { promise, subscription };
    }

    // ── Mode persistence ─────────────────────────────────────────────────────

    describe('agent mode persistence', () => {
        it('initial mode$ value defaults to "simple" when localStorage has no stored value', () => {
            // beforeEach cleared the key.
            buildService();
            expect(service.mode$.value).toBe('simple');
        });

        it('initial mode$ value is "simple" when localStorage contains "simple"', () => {
            window.localStorage.setItem(LOCAL_STORAGE_MODE_KEY, 'simple');
            buildService();
            expect(service.mode$.value).toBe('simple');
        });

        it('initial mode$ value is "deep" when localStorage contains "deep"', () => {
            window.localStorage.setItem(LOCAL_STORAGE_MODE_KEY, 'deep');
            buildService();
            expect(service.mode$.value).toBe('deep');
        });

        it('initial mode$ falls back to "simple" when localStorage contains garbage', () => {
            window.localStorage.setItem(LOCAL_STORAGE_MODE_KEY, 'ultra-deep');
            buildService();
            expect(service.mode$.value).toBe('simple');
        });

        it('initial mode$ falls back to "simple" when localStorage.getItem throws (SecurityError-style)', () => {
            spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError: storage disabled');
            buildService();
            expect(service.mode$.value).toBe('simple');
        });

        it('setMode("deep") writes "deep" to localStorage and emits "deep" on mode$', () => {
            buildService();

            const emissions: string[] = [];
            const sub = service.mode$.subscribe((v) => emissions.push(v));

            service.setMode('deep');

            expect(window.localStorage.getItem(LOCAL_STORAGE_MODE_KEY)).toBe('deep');
            // BehaviorSubject replays the latest value to the subscriber on attach
            // (here "simple"), then emits "deep" after setMode.
            expect(emissions).toEqual(['simple', 'deep']);
            expect(service.mode$.value).toBe('deep');

            sub.unsubscribe();
        });

        it('setMode("simple") writes "simple" to localStorage and emits "simple" on mode$', () => {
            window.localStorage.setItem(LOCAL_STORAGE_MODE_KEY, 'deep');
            buildService();
            expect(service.mode$.value).toBe('deep');

            const emissions: string[] = [];
            const sub = service.mode$.subscribe((v) => emissions.push(v));

            service.setMode('simple');

            expect(window.localStorage.getItem(LOCAL_STORAGE_MODE_KEY)).toBe('simple');
            expect(emissions).toEqual(['deep', 'simple']);
            expect(service.mode$.value).toBe('simple');

            sub.unsubscribe();
        });

        it('setMode() with an invalid mode is rejected (no localStorage write, no emit)', () => {
            buildService();

            const emissions: string[] = [];
            const sub = service.mode$.subscribe((v) => emissions.push(v));

            service.setMode('bogus' as 'simple');

            expect(window.localStorage.getItem(LOCAL_STORAGE_MODE_KEY)).toBeNull();
            // Only the initial BehaviorSubject replay — no new emission.
            expect(emissions).toEqual(['simple']);

            sub.unsubscribe();
        });

        it('setMode() does not crash when localStorage.setItem throws', () => {
            buildService();
            spyOn(Storage.prototype, 'setItem').and.throwError('SecurityError: storage disabled');

            expect(() => service.setMode('deep')).not.toThrow();
            // In-memory state still flips even though persistence failed.
            expect(service.mode$.value).toBe('deep');
        });
    });

    // ── streamChat: request shape ────────────────────────────────────────────

    describe('streamChat() request shape', () => {
        it('calls fetch() with POST + JSON body + correct URL + Content-Type header', async () => {
            buildService();
            const fetchSpy = spyOn(window, 'fetch').and.resolveTo(okResponse(streamFromChunks([])));

            const { promise } = collect(service.streamChat('چند رکورد؟', 'deep'));
            await promise;

            expect(fetchSpy).toHaveBeenCalledTimes(1);
            const [url, init] = fetchSpy.calls.mostRecent().args as [string, RequestInit];
            expect(url).toBe(`${environment.apiBase}/chat`);
            expect(init.method).toBe('POST');

            const headers = init.headers as Record<string, string>;
            expect(headers['Content-Type']).toBe('application/json');

            const body = JSON.parse(init.body as string);
            expect(body).toEqual({ question: 'چند رکورد؟', mode: 'deep' });

            // AbortController.signal is plumbed through.
            expect(init.signal).toBeDefined();
        });

        it('sends mode "simple" exactly as supplied (Persian-question payload preserved)', async () => {
            buildService();
            const fetchSpy = spyOn(window, 'fetch').and.resolveTo(okResponse(streamFromChunks([])));

            const { promise } = collect(service.streamChat('چه خبر؟', 'simple'));
            await promise;

            const init = fetchSpy.calls.mostRecent().args[1] as RequestInit;
            const body = JSON.parse(init.body as string);
            expect(body).toEqual({ question: 'چه خبر؟', mode: 'simple' });
        });
    });

    // ── streamChat: NDJSON parsing ──────────────────────────────────────────

    describe('streamChat() NDJSON parsing', () => {
        it('emits two ChatEvents when one chunk contains two complete lines', async () => {
            buildService();
            const body = streamFromChunks([
                encode('{"type":"text","content":"a"}\n{"type":"text","content":"b"}\n'),
            ]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { promise } = collect(service.streamChat('q', 'simple'));
            const { events, errored } = await promise;

            expect(errored).toBeFalse();
            expect(events).toEqual([
                { type: 'text', content: 'a' },
                { type: 'text', content: 'b' },
            ]);
        });

        it('buffers a partial line across chunks until it sees the newline', async () => {
            buildService();
            const body = streamFromChunks([
                // First chunk: complete first event + partial second event.
                encode('{"type":"text","content":"hello"}\n{"type":"text","con'),
                // Second chunk: rest of the second event + newline.
                encode('tent":"world"}\n'),
            ]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events, errored } = await collect(service.streamChat('q', 'simple')).promise;

            expect(errored).toBeFalse();
            expect(events).toEqual([
                { type: 'text', content: 'hello' },
                { type: 'text', content: 'world' },
            ]);
        });

        it('ignores trailing blank lines and pure-whitespace between events', async () => {
            buildService();
            const body = streamFromChunks([
                encode('{"type":"text","content":"a"}\n\n   \n{"type":"text","content":"b"}\n\n'),
            ]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events } = await collect(service.streamChat('q', 'simple')).promise;

            // Only the two text events — the blank/whitespace lines must not produce any event.
            expect(events).toEqual([
                { type: 'text', content: 'a' },
                { type: 'text', content: 'b' },
            ]);
        });

        it('silently drops a malformed JSON line without crashing the stream', async () => {
            buildService();
            const body = streamFromChunks([
                encode(
                    '{"type":"text","content":"before"}\n' +
                        'this is not json\n' +
                        '{"type":"text","content":"after"}\n',
                ),
            ]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events, errored } = await collect(service.streamChat('q', 'simple')).promise;

            expect(errored).toBeFalse();
            expect(events).toEqual([
                { type: 'text', content: 'before' },
                { type: 'text', content: 'after' },
            ]);
        });

        it('also drops a JSON value that is valid but not a ChatEvent shape (no `type` string)', async () => {
            buildService();
            const body = streamFromChunks([
                encode('123\n{"foo":"bar"}\n{"type":"text","content":"ok"}\n'),
            ]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events } = await collect(service.streamChat('q', 'simple')).promise;

            expect(events).toEqual([{ type: 'text', content: 'ok' }]);
        });

        it('parses all four event types (text / tool_start / tool_end / error)', async () => {
            buildService();
            const lines = [
                '{"type":"text","content":"hi"}',
                '{"type":"tool_start","id":"t1","name":"execute_sql","args":{"query":"SELECT 1"}}',
                '{"type":"tool_end","id":"t1","name":"execute_sql","output":"{\\"rows\\":[]}"}',
                '{"type":"error","message":"boom"}',
                '',
            ];
            const body = streamFromChunks([encode(lines.join('\n'))]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events, errored } = await collect(service.streamChat('q', 'deep')).promise;

            expect(errored).toBeFalse();
            expect(events.length).toBe(4);

            expect(events[0]).toEqual({ type: 'text', content: 'hi' });

            const tStart = events[1] as Extract<ChatEvent, { type: 'tool_start' }>;
            expect(tStart.type).toBe('tool_start');
            expect(tStart.id).toBe('t1');
            expect(tStart.name).toBe('execute_sql');
            expect(tStart.args).toEqual({ query: 'SELECT 1' });

            const tEnd = events[2] as Extract<ChatEvent, { type: 'tool_end' }>;
            expect(tEnd.type).toBe('tool_end');
            expect(tEnd.id).toBe('t1');
            expect(tEnd.name).toBe('execute_sql');
            expect(tEnd.output).toBe('{"rows":[]}');

            expect(events[3]).toEqual({ type: 'error', message: 'boom' });
        });

        it('handles a tool_start with null id (OpenAI-compatible providers may omit the id)', async () => {
            buildService();
            const body = streamFromChunks([
                encode('{"type":"tool_start","id":null,"name":"python_exec","args":{}}\n'),
            ]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events } = await collect(service.streamChat('q', 'simple')).promise;

            const evt = events[0] as Extract<ChatEvent, { type: 'tool_start' }>;
            expect(evt.type).toBe('tool_start');
            expect(evt.id).toBeNull();
            expect(evt.name).toBe('python_exec');
        });

        it('empty stream (zero bytes) completes with zero events and no errors', async () => {
            buildService();
            const body = streamFromChunks([]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events, errored } = await collect(service.streamChat('q', 'simple')).promise;

            expect(errored).toBeFalse();
            expect(events).toEqual([]);
        });

        it('flushes a trailing line without a final newline (no buffered loss)', async () => {
            buildService();
            const body = streamFromChunks([encode('{"type":"text","content":"tail"}')]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events } = await collect(service.streamChat('q', 'simple')).promise;
            expect(events).toEqual([{ type: 'text', content: 'tail' }]);
        });

        it('preserves Persian content in a text event verbatim', async () => {
            buildService();
            const body = streamFromChunks([
                encode('{"type":"text","content":"این یک پاسخ فارسی است"}\n'),
            ]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { events } = await collect(service.streamChat('سؤال', 'simple')).promise;

            const evt = events[0] as Extract<ChatEvent, { type: 'text' }>;
            expect(evt.content).toBe('این یک پاسخ فارسی است');
            expect(Array.from(evt.content).length).toBe(Array.from('این یک پاسخ فارسی است').length);
        });
    });

    // ── streamChat: error paths ─────────────────────────────────────────────

    describe('streamChat() error handling', () => {
        it('on non-200 response: emits a synthetic error event with STREAM_ERROR_MESSAGE then completes', async () => {
            buildService();
            spyOn(window, 'fetch').and.resolveTo(
                new Response('server error', { status: 500 }),
            );

            const { events, errored } = await collect(service.streamChat('q', 'simple')).promise;

            expect(errored).toBeFalse();
            expect(events).toEqual([{ type: 'error', message: STREAM_ERROR_MESSAGE }]);
            expect(STREAM_ERROR_MESSAGE).toBe('خطا در ارتباط با سرور');
        });

        it('on fetch reject (network error): emits a synthetic error event then completes (no unhandled error)', async () => {
            buildService();
            spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'));

            const { events, errored } = await collect(service.streamChat('q', 'simple')).promise;

            expect(errored).toBeFalse();
            expect(events).toEqual([{ type: 'error', message: STREAM_ERROR_MESSAGE }]);
        });

        it('on response with no body: emits a synthetic error event then completes', async () => {
            buildService();
            // Status 204 — Fetch spec returns a Response whose body is null for No Content.
            spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 204 }));

            const { events, errored } = await collect(service.streamChat('q', 'simple')).promise;

            expect(errored).toBeFalse();
            expect(events).toEqual([{ type: 'error', message: STREAM_ERROR_MESSAGE }]);
        });
    });

    // ── streamChat: LoadingService bracket ──────────────────────────────────

    describe('streamChat() LoadingService bracket', () => {
        it('calls start() before fetch and stop() after stream completes (happy path)', async () => {
            buildService();
            const body = streamFromChunks([encode('{"type":"text","content":"a"}\n')]);
            spyOn(window, 'fetch').and.resolveTo(okResponse(body));

            const { promise } = collect(service.streamChat('q', 'simple'));
            // start() is invoked synchronously inside the Observable factory before fetch begins.
            expect(loadingStartSpy).toHaveBeenCalledTimes(1);

            await promise;

            expect(loadingStopSpy).toHaveBeenCalledTimes(1);
        });

        it('calls stop() even when fetch rejects (network error)', async () => {
            buildService();
            spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'));

            await collect(service.streamChat('q', 'simple')).promise;

            expect(loadingStartSpy).toHaveBeenCalledTimes(1);
            expect(loadingStopSpy).toHaveBeenCalledTimes(1);
        });

        it('calls stop() even when the response is non-200', async () => {
            buildService();
            spyOn(window, 'fetch').and.resolveTo(new Response('err', { status: 500 }));

            await collect(service.streamChat('q', 'simple')).promise;

            expect(loadingStartSpy).toHaveBeenCalledTimes(1);
            expect(loadingStopSpy).toHaveBeenCalledTimes(1);
        });
    });

    // ── streamChat: unsubscribe / abort ─────────────────────────────────────

    describe('streamChat() teardown / abort', () => {
        it('unsubscribing aborts the underlying fetch via AbortController.abort()', async () => {
            buildService();
            const abortSpy = spyOn(AbortController.prototype, 'abort').and.callThrough();

            // A stream that never finishes — fetch returns a Response whose body
            // never emits chunks. The subscriber unsubscribes before completion.
            const neverClosingBody = new ReadableStream<Uint8Array>({
                start(_controller): void {
                    // Intentionally don't enqueue anything and don't close. The reader
                    // hangs at reader.read() until abort() is called on the signal.
                },
            });
            spyOn(window, 'fetch').and.resolveTo(okResponse(neverClosingBody));

            const events: ChatEvent[] = [];
            const sub = service.streamChat('q', 'simple').subscribe((e) => events.push(e));

            // Allow the Observable factory's microtasks to: (1) call fetch, (2) resolve
            // the Response, (3) reach the reader.read() that will hang on no-chunks-and-no-close.
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

            sub.unsubscribe();

            expect(abortSpy).toHaveBeenCalledTimes(1);
            expect(events).toEqual([]);
        });
    });
});
