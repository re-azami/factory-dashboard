import { Component, Input } from '@angular/core';

import { NgxHelperHttpService } from '@webilix/ngx-helper';

import { ISupportTicketAttachmentDTO } from '@lib/apis';
import { ConfigService } from '@lib/providers';

@Component({
    selector: 'ticket-attachment-view',
    templateUrl: './ticket-attachment-view.component.html',
    styleUrl: './ticket-attachment-view.component.scss',
    standalone: false
})
export class TicketAttachmentViewComponent {
    @Input({ required: true }) attachments: ISupportTicketAttachmentDTO[] = [];
    @Input({ required: false }) padding: string = '0';

    constructor(
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly configService: ConfigService,
    ) {}

    download(index: number): void {
        if (!this.attachments[index]) return;

        const attachment: ISupportTicketAttachmentDTO = this.attachments[index];
        const path: string = this.configService.getApiUrl(attachment.path);
        this.ngxHelperHttpService.download(attachment.file, path);
    }
}
