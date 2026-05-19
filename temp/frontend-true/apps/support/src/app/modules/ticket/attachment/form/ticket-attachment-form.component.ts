import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ApiService, ISupportTicketAttachmentDTO } from '@lib/apis';

@Component({
    selector: 'ticket-attachment-form',
    templateUrl: './ticket-attachment-form.component.html',
    styleUrl: './ticket-attachment-form.component.scss',
    standalone: false
})
export class TicketAttachmentFormComponent {
    @ViewChild('fileUpload') fileUpload?: ElementRef;

    @Input({ required: true }) attachments: ISupportTicketAttachmentDTO[] = [];
    @Output() attachmentsChange: EventEmitter<ISupportTicketAttachmentDTO[]> = new EventEmitter<
        ISupportTicketAttachmentDTO[]
    >();

    public deleteIndex?: number;

    constructor(private readonly apiService: ApiService) {}

    select(): void {
        if (!this.fileUpload) return;

        const element: HTMLInputElement = this.fileUpload.nativeElement;
        element.value = '';
        element.click();
    }

    upload(event: Event): void {
        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        const file: File = files[0];

        this.apiService.upload('SUPPORT_TICKET_ATTACHMENT_USER', file, (response) => {
            const attachment: ISupportTicketAttachmentDTO = {
                file: file.name,
                path: response.path,
                mime: response.mime,
                size: response.size,
            };
            this.attachments.push(attachment);
            this.attachmentsChange.emit(this.attachments);
            this.deleteIndex = undefined;
        });
    }

    delete(index: number, confirm: boolean = false): void {
        if (!this.attachments[index]) return;

        if (!confirm) this.deleteIndex = index;
        else {
            this.attachments.splice(index, 1);
            this.attachmentsChange.emit(this.attachments);
            this.deleteIndex = undefined;
        }
    }
}
