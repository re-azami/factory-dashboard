import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AgentMode, ChatEvent } from '../../pages/chat/models/chat-event';
import { LoadingService } from './loading.service';

/**
 * Key used to persist the agent mode in localStorage. Mirrors the pattern used
 * by AppService for color-mode persistence.
 */
export const LOCAL_STORAGE_MODE_KEY = 'factory-dashboard:agent-mode';

/**
 * Generic stream-error message shown when the backend is unreachable or
 * returns a non-200. The chat page also displays this as an error block
 * inside the assistant message.
 */
export const STREAM_ERROR_MESSAGE = 'خطا در ارتباط با سرور';

/**
 * Service for the Chat page.
 *
 * Two responsibilities:
 *   1. Persisted agent-mode preference exposed as `mode$`.
 *   2. NDJSON streaming via native fetch() + ReadableStream — Angular's
 *      HttpClient buffers the full response, which is unsuitable for the
 *      token-by-token stream that POST /chat emits.
 *
 * The stream is bracketed with LoadingService.start()/stop() so the global
 * progress bar in the page header lights up just like for HttpClient requests.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
    private readonly _mode$ = new BehaviorSubject<AgentMode>(this.readStoredMode());
    /** Current agent mode as a hot observable. Replays the latest value to new subscribers. */
    get mode$(): BehaviorSubject<AgentMode> {
        return this._mode$;
    }

    constructor(private readonly loadingService: LoadingService) {}

    /**
     * Update the persisted agent mode and notify subscribers. Invalid values
     * are silently rejected so a UI bug can't write garbage to localStorage.
     */
    setMode(mode: AgentMode): void {
        if (mode !== 'simple' && mode !== 'deep') return;
        this.persistMode(mode);
        this._mode$.next(mode);
    }

    /**
     * Stream the agent's reply for a question.
     *
     * Emits one `ChatEvent` per NDJSON line. On non-200 or fetch reject, emits a
     * single synthetic `{type:'error',message: STREAM_ERROR_MESSAGE}` and completes.
     * Loading flag is started before the fetch and stopped in a `finally` so it
     * is released exactly once regardless of network outcome.
     */
    streamChat(question: string, mode: AgentMode): Observable<ChatEvent> {
        return new Observable<ChatEvent>((subscriber) => {
            const controller = new AbortController();
            this.loadingService.start();

            const run = async (): Promise<void> => {
                try {
                    let response: Response;
                    try {
                        response = await fetch(`${environment.apiBase}/chat`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ question, mode }),
                            signal: controller.signal,
                        });
                    } catch {
                        subscriber.next({ type: 'error', message: STREAM_ERROR_MESSAGE });
                        subscriber.complete();
                        return;
                    }

                    if (!response.ok || !response.body) {
                        subscriber.next({ type: 'error', message: STREAM_ERROR_MESSAGE });
                        subscriber.complete();
                        return;
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder('utf-8');
                    let buffer = '';

                    // Read chunks until done. Each chunk may contain zero, one,
                    // or many complete NDJSON lines plus a partial trailing line.
                    while (true) {
                        let chunk: ReadableStreamReadResult<Uint8Array>;
                        try {
                            chunk = await reader.read();
                        } catch {
                            subscriber.next({ type: 'error', message: STREAM_ERROR_MESSAGE });
                            break;
                        }
                        if (chunk.done) break;

                        buffer += decoder.decode(chunk.value, { stream: true });

                        let newlineIndex = buffer.indexOf('\n');
                        while (newlineIndex !== -1) {
                            const line = buffer.slice(0, newlineIndex).trim();
                            buffer = buffer.slice(newlineIndex + 1);
                            if (line.length > 0) {
                                const parsed = this.parseLine(line);
                                if (parsed !== null) subscriber.next(parsed);
                            }
                            newlineIndex = buffer.indexOf('\n');
                        }
                    }

                    // Flush whatever's left in the buffer when the stream ends
                    // without a trailing newline.
                    const tail = buffer.trim();
                    if (tail.length > 0) {
                        const parsed = this.parseLine(tail);
                        if (parsed !== null) subscriber.next(parsed);
                    }

                    subscriber.complete();
                } finally {
                    this.loadingService.stop();
                }
            };

            run();

            return () => {
                controller.abort();
            };
        });
    }

    private parseLine(line: string): ChatEvent | null {
        try {
            const obj = JSON.parse(line);
            if (obj && typeof obj === 'object' && typeof obj.type === 'string') {
                return obj as ChatEvent;
            }
            return null;
        } catch {
            return null;
        }
    }

    private readStoredMode(): AgentMode {
        if (typeof window === 'undefined' || !window.localStorage) return 'simple';
        try {
            const stored = window.localStorage.getItem(LOCAL_STORAGE_MODE_KEY);
            return stored === 'deep' ? 'deep' : 'simple';
        } catch {
            return 'simple';
        }
    }

    private persistMode(mode: AgentMode): void {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            window.localStorage.setItem(LOCAL_STORAGE_MODE_KEY, mode);
        } catch {
            // localStorage may be unavailable (private mode quota / SecurityError); ignore.
        }
    }
}
