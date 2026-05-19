import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ChatService, STREAM_ERROR_MESSAGE } from '../../shared/services/chat.service';
import { PageService } from '../../shared/services/page.service';
import {
    AgentMode,
    ChatEvent,
    ChatMessage,
    ChatTextBlock,
    ChatToolBlock,
} from './models/chat-event';

/**
 * Top-level Chat page.
 *
 * Owns:
 *   - the visible message list (`messages`)
 *   - the streaming state flag (`isStreaming`)
 *   - the current agent mode (kept in sync with ChatService.mode$)
 *
 * Stream handling:
 *   - text events append to (or extend) the last text block on the in-flight
 *     assistant message
 *   - tool_start adds a running tool block; tool_end fills its output and
 *     marks it complete (matched by id first, then by name as a fallback)
 *   - error events append a red error block
 *   - non-200 / network failure: append an error block, stop streaming
 */
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss',
    standalone: false,
})
export class ChatComponent implements OnInit, OnDestroy {
    public messages: ChatMessage[] = [];
    public mode: AgentMode = 'simple';
    public isStreaming: boolean = false;

    private modeSub?: Subscription;
    private streamSub?: Subscription;

    constructor(
        private readonly chatService: ChatService,
        private readonly pageService: PageService,
    ) {}

    ngOnInit(): void {
        this.pageService.setPageTitle({ title: 'گفتگو با عامل' });
        this.mode = this.chatService.mode$.value;
        this.modeSub = this.chatService.mode$.subscribe((mode) => (this.mode = mode));
    }

    ngOnDestroy(): void {
        this.modeSub?.unsubscribe();
        this.streamSub?.unsubscribe();
    }

    onModeChange(mode: AgentMode): void {
        // Ignore mode changes mid-stream so the in-flight request stays consistent.
        if (this.isStreaming) return;
        this.chatService.setMode(mode);
    }

    onSubmit(question: string): void {
        const trimmed = question.trim();
        if (!trimmed || this.isStreaming) return;

        this.messages.push({ role: 'user', blocks: [{ kind: 'text', text: trimmed }] });

        const assistant: ChatMessage = { role: 'assistant', blocks: [] };
        this.messages.push(assistant);

        this.isStreaming = true;
        this.streamSub = this.chatService.streamChat(trimmed, this.mode).subscribe({
            next: (event: ChatEvent) => this.handleEvent(assistant, event),
            error: () => {
                assistant.blocks.push({ kind: 'error', error: STREAM_ERROR_MESSAGE });
                this.isStreaming = false;
            },
            complete: () => {
                this.isStreaming = false;
            },
        });
    }

    onClear(): void {
        if (this.isStreaming) {
            // Abort the in-flight stream by unsubscribing — ChatService listens
            // to the AbortController in its teardown.
            this.streamSub?.unsubscribe();
            this.streamSub = undefined;
            this.isStreaming = false;
        }
        this.messages = [];
    }

    private handleEvent(assistant: ChatMessage, event: ChatEvent): void {
        switch (event.type) {
            case 'text':
                this.appendText(assistant, event.content);
                return;
            case 'tool_start':
                this.appendToolStart(assistant, event.id, event.name, event.args);
                return;
            case 'tool_end':
                this.fillToolEnd(assistant, event.id, event.name, event.output);
                return;
            case 'error':
                assistant.blocks.push({ kind: 'error', error: event.message });
                return;
        }
    }

    private appendText(assistant: ChatMessage, content: string): void {
        if (!content) return;
        const last = assistant.blocks[assistant.blocks.length - 1];
        if (last && last.kind === 'text') {
            (last as ChatTextBlock).text += content;
            return;
        }
        assistant.blocks.push({ kind: 'text', text: content });
    }

    private appendToolStart(
        assistant: ChatMessage,
        id: string | null,
        name: string,
        args: Record<string, unknown>,
    ): void {
        const block: ChatToolBlock = {
            kind: 'tool',
            id,
            name,
            args: args ?? {},
            state: 'running',
        };
        assistant.blocks.push(block);
    }

    private fillToolEnd(
        assistant: ChatMessage,
        id: string | null,
        name: string,
        output: string,
    ): void {
        // Prefer matching by id; fall back to the most recent running tool of
        // the same name (matches the Streamlit fallback used in frontend/app.py).
        let target: ChatToolBlock | undefined;
        if (id !== null) {
            target = assistant.blocks.find(
                (b): b is ChatToolBlock => b.kind === 'tool' && b.id === id && b.state === 'running',
            );
        }
        if (!target) {
            for (let i = assistant.blocks.length - 1; i >= 0; i--) {
                const b = assistant.blocks[i];
                if (b.kind === 'tool' && b.name === name && b.state === 'running') {
                    target = b;
                    break;
                }
            }
        }
        if (!target) return;
        target.output = output;
        target.state = 'complete';
    }

    trackMessage(_index: number, _message: ChatMessage): number {
        return _index;
    }
}
