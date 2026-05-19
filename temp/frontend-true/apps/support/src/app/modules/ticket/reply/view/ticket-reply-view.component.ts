import { Component, Input } from '@angular/core';

import { ISupportTicketDTO } from '@lib/apis';

@Component({
    selector: 'ticket-reply-view',
    templateUrl: './ticket-reply-view.component.html',
    styleUrl: './ticket-reply-view.component.scss',
    standalone: false
})
export class TicketReplyViewComponent {
    @Input({ required: true }) ticket!: ISupportTicketDTO;
    @Input({ required: true }) reply!: number;
}
