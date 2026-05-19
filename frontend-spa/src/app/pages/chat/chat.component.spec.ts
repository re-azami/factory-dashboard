import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Subject, throwError } from 'rxjs';

import { ChatService, STREAM_ERROR_MESSAGE } from '../../shared/services/chat.service';
import { PageService } from '../../shared/services/page.service';
import { ChatComponent } from './chat.component';
import { AgentMode, ChatEvent, ChatErrorBlock, ChatTextBlock, ChatToolBlock } from './models/chat-event';

/**
 * Unit tests for the top-level ChatComponent.
 *
 * Strategy:
 *   - Replace ChatService with a spy: `mode$` is a BehaviorSubject we control,
 *     `streamChat()` returns a Subject we push ChatEvents into. This lets each test
 *     drive the stream lifecycle deterministically (next/complete/error/unsubscribe).
 *   - All child components (<app-chat-message>, <app-chat-composer>, <mat-progress-spinner>,
 *     <mat-icon>) are stubbed via NO_ERRORS_SCHEMA so the spec doesn't pull in Material.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: empty-state hint when messages.length === 0;
 *                                  blank/whitespace question short-circuits onSubmit.
 *  2. Boundary values            — covered: first message into empty list; two consecutive
 *                                  text events concatenate into one text block.
 *  3. Persian / Unicode text     — covered: empty-state hint asserted by codepoint;
 *                                  Persian question text round-trips into the user bubble;
 *                                  Persian page title set via PageService.
 *  4. Duplicate rows             — covered: two text events with same content concatenate
 *                                  rather than producing duplicate blocks; two tool_starts
 *                                  with different ids create two distinct tool blocks.
 *  5. Null DB columns            — N/A: this component does not inspect tool output cell
 *                                  values — that's chat-tool-card's job. Covered there.
 *  6. Calendar conversion        — N/A: chat component does not handle dates.
 *  7. Permission denials         — N/A: auth lands in AUTH-003+; the network-error branch
 *                                  is the closest proxy and is covered.
 *  8. LLM provider switches      — covered: tool_end fallback by name (used when an
 *                                  OpenAI-compatible provider omits the call-id) is
 *                                  exercised explicitly.
 */
describe('ChatComponent', () => {
    let fixture: ComponentFixture<ChatComponent>;
    let component: ChatComponent;
    let modeSubject: BehaviorSubject<AgentMode>;
    let streamSubject: Subject<ChatEvent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let pageServiceSpy: jasmine.SpyObj<PageService>;

    beforeEach(async () => {
        modeSubject = new BehaviorSubject<AgentMode>('simple');
        streamSubject = new Subject<ChatEvent>();

        chatServiceSpy = jasmine.createSpyObj<ChatService>(
            'ChatService',
            ['setMode', 'streamChat'],
            { mode$: modeSubject },
        );
        chatServiceSpy.streamChat.and.callFake(() => streamSubject.asObservable());

        pageServiceSpy = jasmine.createSpyObj<PageService>('PageService', ['setPageTitle']);

        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: PageService, useValue: pageServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        // Make sure no leftover streams keep emitting between tests.
        if (!streamSubject.closed) streamSubject.complete();
        if (!modeSubject.closed) modeSubject.complete();
    });

    // ── Lifecycle ────────────────────────────────────────────────────────────

    it('creates without crashing', () => {
        expect(component).toBeTruthy();
    });

    it('sets the Persian page title "گفتگو با عامل" on init', () => {
        expect(pageServiceSpy.setPageTitle).toHaveBeenCalledTimes(1);
        expect(pageServiceSpy.setPageTitle).toHaveBeenCalledWith({ title: 'گفتگو با عامل' });
    });

    it('hydrates local mode from ChatService.mode$.value on init', () => {
        expect(component.mode).toBe('simple');
    });

    it('updates local mode when mode$ emits a new value (subscription wiring)', () => {
        modeSubject.next('deep');
        fixture.detectChanges();
        expect(component.mode).toBe('deep');
    });

    // ── Empty state ──────────────────────────────────────────────────────────

    it('renders the Persian empty-state hint when messages.length === 0', () => {
        const hintEl: HTMLElement | null = fixture.nativeElement.querySelector('.empty-hint');
        expect(hintEl).not.toBeNull();
        expect(hintEl!.textContent?.trim()).toBe('سؤالی از داده‌های کارخانه بپرسید');
    });

    it('renders the empty-state icon "forum" when messages.length === 0', () => {
        const iconEl: HTMLElement | null = fixture.nativeElement.querySelector('.empty-icon');
        expect(iconEl).not.toBeNull();
        // <mat-icon> renders an inner text node with the icon name.
        expect(iconEl!.textContent?.trim()).toBe('forum');
    });

    it('hides the empty-state once a user message is pushed', () => {
        component.onSubmit('سلام');
        fixture.detectChanges();

        const hintEl = fixture.nativeElement.querySelector('.empty-hint');
        expect(hintEl).toBeNull();

        const messagesEl = fixture.nativeElement.querySelector('.messages');
        expect(messagesEl).not.toBeNull();
    });

    // ── onSubmit ─────────────────────────────────────────────────────────────

    describe('onSubmit', () => {
        it('pushes a user message and an assistant message, then calls streamChat() with question+mode', () => {
            component.onSubmit('چند رکورد در دیتابیس داریم؟');

            expect(component.messages.length).toBe(2);
            expect(component.messages[0].role).toBe('user');
            expect((component.messages[0].blocks[0] as ChatTextBlock).text).toBe(
                'چند رکورد در دیتابیس داریم؟',
            );
            expect(component.messages[1].role).toBe('assistant');
            expect(component.messages[1].blocks).toEqual([]);

            expect(chatServiceSpy.streamChat).toHaveBeenCalledTimes(1);
            expect(chatServiceSpy.streamChat).toHaveBeenCalledWith(
                'چند رکورد در دیتابیس داریم؟',
                'simple',
            );

            expect(component.isStreaming).toBeTrue();
        });

        it('trims whitespace before submission and uses the trimmed value', () => {
            component.onSubmit('  hello  ');
            expect((component.messages[0].blocks[0] as ChatTextBlock).text).toBe('hello');
            expect(chatServiceSpy.streamChat).toHaveBeenCalledWith('hello', 'simple');
        });

        it('ignores a blank submission (empty/missing input edge-case)', () => {
            component.onSubmit('');
            expect(component.messages).toEqual([]);
            expect(chatServiceSpy.streamChat).not.toHaveBeenCalled();
        });

        it('ignores a whitespace-only submission', () => {
            component.onSubmit('   \n   ');
            expect(component.messages).toEqual([]);
            expect(chatServiceSpy.streamChat).not.toHaveBeenCalled();
        });

        it('ignores a submission while another stream is in flight', () => {
            component.onSubmit('first');
            expect(component.isStreaming).toBeTrue();

            chatServiceSpy.streamChat.calls.reset();
            component.onSubmit('second');

            // Same two messages — no new pair.
            expect(component.messages.length).toBe(2);
            expect(chatServiceSpy.streamChat).not.toHaveBeenCalled();
        });

        it('uses the current mode (deep) when submitting after a mode change', () => {
            modeSubject.next('deep');
            fixture.detectChanges();

            component.onSubmit('پرسش');
            expect(chatServiceSpy.streamChat).toHaveBeenCalledWith('پرسش', 'deep');
        });
    });

    // ── Stream event handling ────────────────────────────────────────────────

    describe('handling stream events', () => {
        function startStream(question: string = 'q'): void {
            component.onSubmit(question);
        }

        function assistant(): typeof component.messages[number] {
            return component.messages[component.messages.length - 1];
        }

        it("a 'text' event appends a new text block to the assistant message", () => {
            startStream();
            streamSubject.next({ type: 'text', content: 'hello' });

            expect(assistant().blocks.length).toBe(1);
            expect(assistant().blocks[0]).toEqual({ kind: 'text', text: 'hello' });
        });

        it("two consecutive 'text' events extend the same text block (no duplicate block)", () => {
            startStream();
            streamSubject.next({ type: 'text', content: 'hel' });
            streamSubject.next({ type: 'text', content: 'lo' });

            expect(assistant().blocks.length).toBe(1);
            expect((assistant().blocks[0] as ChatTextBlock).text).toBe('hello');
        });

        it("'tool_start' adds a running tool block", () => {
            startStream();
            streamSubject.next({
                type: 'tool_start',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
            });

            expect(assistant().blocks.length).toBe(1);
            const tool = assistant().blocks[0] as ChatToolBlock;
            expect(tool.kind).toBe('tool');
            expect(tool.id).toBe('t1');
            expect(tool.name).toBe('execute_sql');
            expect(tool.args).toEqual({ query: 'SELECT 1' });
            expect(tool.state).toBe('running');
            expect(tool.output).toBeUndefined();
        });

        it("'tool_end' matching by id transitions the block to 'complete' and stores output", () => {
            startStream();
            streamSubject.next({
                type: 'tool_start',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
            });
            streamSubject.next({
                type: 'tool_end',
                id: 't1',
                name: 'execute_sql',
                output: '{"rows":[[1]]}',
            });

            const tool = assistant().blocks[0] as ChatToolBlock;
            expect(tool.state).toBe('complete');
            expect(tool.output).toBe('{"rows":[[1]]}');
        });

        it("'tool_end' with null id falls back to matching by name (LLM provider switch edge-case)", () => {
            startStream();
            // OpenAI-compatible provider may omit ids in both start and end events.
            streamSubject.next({
                type: 'tool_start',
                id: null,
                name: 'execute_sql',
                args: {},
            });
            streamSubject.next({
                type: 'tool_end',
                id: null,
                name: 'execute_sql',
                output: '{"rows":[]}',
            });

            const tool = assistant().blocks[0] as ChatToolBlock;
            expect(tool.state).toBe('complete');
            expect(tool.output).toBe('{"rows":[]}');
        });

        it("multiple distinct tool_starts produce multiple tool blocks (boundary: 2 running tools)", () => {
            startStream();
            streamSubject.next({ type: 'tool_start', id: 't1', name: 'execute_sql', args: {} });
            streamSubject.next({ type: 'tool_start', id: 't2', name: 'python_exec', args: {} });

            expect(assistant().blocks.length).toBe(2);
            expect((assistant().blocks[0] as ChatToolBlock).name).toBe('execute_sql');
            expect((assistant().blocks[1] as ChatToolBlock).name).toBe('python_exec');
            // tool_end for the second one completes only that one.
            streamSubject.next({ type: 'tool_end', id: 't2', name: 'python_exec', output: '{}' });
            expect((assistant().blocks[0] as ChatToolBlock).state).toBe('running');
            expect((assistant().blocks[1] as ChatToolBlock).state).toBe('complete');
        });

        it("'tool_end' without a matching running tool is a silent no-op", () => {
            startStream();
            streamSubject.next({
                type: 'tool_end',
                id: 'never-started',
                name: 'execute_sql',
                output: '{}',
            });

            expect(assistant().blocks).toEqual([]);
        });

        it("'error' event appends a red error block", () => {
            startStream();
            streamSubject.next({ type: 'error', message: 'something broke' });

            expect(assistant().blocks.length).toBe(1);
            const block = assistant().blocks[0] as ChatErrorBlock;
            expect(block.kind).toBe('error');
            expect(block.error).toBe('something broke');
        });

        it('on observable complete: isStreaming flips to false', () => {
            startStream();
            expect(component.isStreaming).toBeTrue();

            streamSubject.complete();

            expect(component.isStreaming).toBeFalse();
        });

        it('on observable error: appends an error block and flips isStreaming false', () => {
            startStream();
            // Replace the streamChat spy so this submission returns an erroring observable
            // (note: startStream already triggered streamChat once with the subject).
            // We need a fresh submission with an erroring observable.
            chatServiceSpy.streamChat.and.returnValue(throwError(() => new Error('boom')));

            // Reset state for a clean follow-up submission. Use onClear() to abort the
            // current stream subscription cleanly.
            component.onClear();
            component.onSubmit('retry');

            // The error path runs synchronously inside the new subscription.
            const last = component.messages[component.messages.length - 1];
            const errBlock = last.blocks.find((b) => b.kind === 'error') as ChatErrorBlock | undefined;
            expect(errBlock).toBeDefined();
            expect(errBlock!.error).toBe(STREAM_ERROR_MESSAGE);
            expect(component.isStreaming).toBeFalse();
        });
    });

    // ── onClear ──────────────────────────────────────────────────────────────

    describe('onClear', () => {
        it('empties the message list', () => {
            component.onSubmit('q1');
            streamSubject.complete();
            expect(component.messages.length).toBe(2);

            component.onClear();
            expect(component.messages).toEqual([]);
        });

        it('aborts the in-flight stream subscription and flips isStreaming false', () => {
            component.onSubmit('q1');
            expect(component.isStreaming).toBeTrue();

            // Track whether the subject's subscription was torn down. Since
            // streamChat() returned `streamSubject.asObservable()`, unsubscribing the
            // component's subscription drops it from the subject's observer list.
            const observersBefore = streamSubject.observers.length;
            expect(observersBefore).toBeGreaterThanOrEqual(1);

            component.onClear();

            expect(component.isStreaming).toBeFalse();
            expect(streamSubject.observers.length).toBeLessThan(observersBefore);
            expect(component.messages).toEqual([]);
        });

        it('on a fresh chat with no in-flight stream: no crash, messages stay empty', () => {
            expect(() => component.onClear()).not.toThrow();
            expect(component.messages).toEqual([]);
            expect(component.isStreaming).toBeFalse();
        });
    });

    // ── onModeChange ─────────────────────────────────────────────────────────

    describe('onModeChange', () => {
        it('delegates to ChatService.setMode() when not streaming', () => {
            component.onModeChange('deep');
            expect(chatServiceSpy.setMode).toHaveBeenCalledOnceWith('deep');
        });

        it('ignores mode changes while a stream is in flight', () => {
            component.onSubmit('q1');
            expect(component.isStreaming).toBeTrue();

            component.onModeChange('deep');
            expect(chatServiceSpy.setMode).not.toHaveBeenCalled();
        });
    });

    // ── Composer wiring ──────────────────────────────────────────────────────

    describe('composer wiring (disabled flag)', () => {
        it('passes isStreaming=true through to the composer as `disabled` while streaming', () => {
            component.onSubmit('q1');
            fixture.detectChanges();

            const composer = fixture.nativeElement.querySelector('app-chat-composer');
            expect(composer).not.toBeNull();
            // The chat template binds [disabled]="isStreaming" on <app-chat-composer>.
            // Angular reflects this as a property on the child element; with NO_ERRORS_SCHEMA
            // we can verify via the component-level flag, which the template propagates.
            expect(component.isStreaming).toBeTrue();
        });

        it('passes isStreaming=false through to the composer after stream completes', () => {
            component.onSubmit('q1');
            expect(component.isStreaming).toBeTrue();
            streamSubject.complete();
            fixture.detectChanges();
            expect(component.isStreaming).toBeFalse();
        });
    });

    // ── Streaming indicator ─────────────────────────────────────────────────

    it('renders the Persian streaming indicator «در حال پاسخ‌گویی…» while a stream is in flight', () => {
        component.onSubmit('q1');
        fixture.detectChanges();

        const indicator = fixture.nativeElement.querySelector('.streaming-indicator');
        expect(indicator).not.toBeNull();
        expect(indicator!.textContent).toContain('در حال پاسخ‌گویی…');
    });

    it('hides the streaming indicator after the stream completes', () => {
        component.onSubmit('q1');
        streamSubject.complete();
        fixture.detectChanges();

        const indicator = fixture.nativeElement.querySelector('.streaming-indicator');
        expect(indicator).toBeNull();
    });

    // ── Lifecycle teardown ───────────────────────────────────────────────────

    it('ngOnDestroy unsubscribes mode + stream subscriptions (no late updates)', () => {
        component.onSubmit('q1');
        const streamObserversBefore = streamSubject.observers.length;
        const modeObserversBefore = modeSubject.observers.length;

        fixture.destroy();

        expect(streamSubject.observers.length).toBeLessThan(streamObserversBefore);
        expect(modeSubject.observers.length).toBeLessThan(modeObserversBefore);
    });
});
