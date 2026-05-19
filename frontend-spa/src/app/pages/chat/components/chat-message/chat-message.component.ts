import { Component, Input } from '@angular/core';

import { ChatBlock, ChatErrorBlock, ChatMessage, ChatTextBlock, ChatToolBlock } from '../../models/chat-event';

/**
 * Renders a single user-or-assistant bubble with its block list.
 *
 * - User messages have exactly one text block; the bubble is right-aligned in
 *   the RTL layout and tinted with `--primaryColor`.
 * - Assistant messages stream in as a mix of text, tool, and error blocks. Tool
 *   blocks delegate to `<app-chat-tool-card>`; error blocks render as a red
 *   banner; text blocks render as `<p>` with `unicode-bidi: plaintext` so
 *   mixed-script paragraphs flow naturally.
 */
@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrl: './chat-message.component.scss',
    standalone: false,
})
export class ChatMessageComponent {
    @Input({ required: true }) message!: ChatMessage;

    trackBlock(index: number, _block: ChatBlock): number {
        return index;
    }

    // Narrowing helpers — Angular's strict templates do not flow-narrow
    // discriminated unions inside `@switch`, so we cast in the component class.
    asText(block: ChatBlock): ChatTextBlock {
        return block as ChatTextBlock;
    }

    asTool(block: ChatBlock): ChatToolBlock {
        return block as ChatToolBlock;
    }

    asError(block: ChatBlock): ChatErrorBlock {
        return block as ChatErrorBlock;
    }
}
