import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm, NgxFormResponsiveComponent } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ISupportTicketAttachmentDTO,
    ISupportTicketDTO,
    ISupportTicketUserReplyRq,
    ISupportTicketUserReplyRs,
} from '@lib/apis';
import { App } from '@lib/shared';

@Component({
    selector: 'ticket-reply-form',
    templateUrl: './ticket-reply-form.component.html',
    styleUrl: './ticket-reply-form.component.scss',
    standalone: false
})
export class TicketReplyFormComponent {
    @ViewChild('ngxFormResponsiveComponent') ngxFormResponsiveComponent?: NgxFormResponsiveComponent;

    @Input({ required: true }) app!: App;
    @Input({ required: true }) ticket!: ISupportTicketDTO;

    @Output() ticketChange: EventEmitter<ISupportTicketDTO> = new EventEmitter<ISupportTicketDTO>();

    public attachments: ISupportTicketAttachmentDTO[] = [];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت پاسخ جدید',
        sections: [
            {
                columns: [{ name: 'reply', type: 'TEXTAREA', title: 'پاسخ', autoHeight: true, maxHeight: 250 }],
            },
        ],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.ticket.id;
        const app: App = this.app;
        const body: ISupportTicketUserReplyRq = {
            reply: values['reply'],
            attachments: this.attachments,
        };
        this.apiService.request<ISupportTicketUserReplyRs>(
            'SupportTicketUserReply',
            { body, ids: { ID }, params: { app } },
            (response) => {
                this.ngxHelperToastService.success('پاسخ با موفقیت ثبت شد.');
                this.ticketChange.emit(response);

                this.ngxFormResponsiveComponent?.ngForm?.resetForm();
                this.attachments = [];
            },
        );
    }
}
