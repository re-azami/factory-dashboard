import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AgentMode } from '../../models/chat-event';

/**
 * Composer: textarea + mode toggle + send + clear-conversation buttons.
 *
 * Stateless — all state lives on the parent `<app-chat>`. Emits:
 *   - `submitted` with the trimmed question text
 *   - `modeChange` when the user picks Simple / Deep
 *   - `cleared` when the user clicks «پاک کردن گفتگو»
 *
 * Enter submits, Shift+Enter inserts a newline. Send button is disabled when
 * `disabled` (i.e. while streaming) or the input is blank.
 */
@Component({
    selector: 'app-chat-composer',
    templateUrl: './chat-composer.component.html',
    styleUrl: './chat-composer.component.scss',
    standalone: false,
})
export class ChatComposerComponent {
    @Input() mode: AgentMode = 'simple';
    @Input() disabled: boolean = false;

    @Output() submitted = new EventEmitter<string>();
    @Output() modeChange = new EventEmitter<AgentMode>();
    @Output() cleared = new EventEmitter<void>();

    public readonly text = new FormControl<string>('', { nonNullable: true });

    onSendClick(): void {
        this.trySubmit();
    }

    onTextareaKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') return;
        if (event.shiftKey) return; // allow newline
        event.preventDefault();
        this.trySubmit();
    }

    onModeChange(value: AgentMode): void {
        if (value !== 'simple' && value !== 'deep') return;
        if (value === this.mode) return;
        this.modeChange.emit(value);
    }

    onClearClick(): void {
        this.cleared.emit();
    }

    get sendDisabled(): boolean {
        return this.disabled || this.text.value.trim().length === 0;
    }

    private trySubmit(): void {
        if (this.sendDisabled) return;
        const value = this.text.value.trim();
        this.submitted.emit(value);
        this.text.setValue('');
    }
}
