import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm, NgxFormResponsiveComponent } from '@webilix/ngx-form';
import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ISupportTicketAttachmentDTO,
    ISupportTicketCloseRs,
    ISupportTicketDTO,
    ISupportTicketReplyRq,
    ISupportTicketReplyRs,
} from '@lib/apis';

@Component({
    selector: 'ticket-reply-form',
    templateUrl: './ticket-reply-form.component.html',
    styleUrl: './ticket-reply-form.component.scss',
    standalone: false
})
export class TicketReplyFormComponent implements OnInit {
    @ViewChild('ngxFormResponsiveComponent') ngxFormResponsiveComponent?: NgxFormResponsiveComponent;

    @Input({ required: true }) ticket!: ISupportTicketDTO;

    @Output() ticketChange: EventEmitter<ISupportTicketDTO> = new EventEmitter<ISupportTicketDTO>();

    public attachments: ISupportTicketAttachmentDTO[] = [];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت پاسخ جدید',
        sections: [{ columns: [{ name: 'reply', type: 'TEXTAREA', title: 'پاسخ', autoHeight: true, maxHeight: 250 }] }],
    };

    constructor(
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        if (this.ticket.status === 'PENDING')
            this.ngxForm.buttons = [{ title: 'پاسخ داده شده', action: this.close.bind(this) }];
    }

    setTicket(ticket: ISupportTicketDTO): void {
        this.ticket = ticket;
        this.ticketChange.emit(this.ticket);
        this.ngxFormResponsiveComponent?.ngForm?.resetForm();
        this.attachments = [];

        this.ngxForm.buttons = [];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.ticket.id;
        const body: ISupportTicketReplyRq = {
            reply: values['reply'],
            attachments: this.attachments,
        };
        this.apiService.request<ISupportTicketReplyRs>('SupportTicketReply', { body, ids: { ID } }, (response) => {
            this.setTicket(response);
            this.ngxHelperToastService.success('پاسخ با موفقیت ثبت شد.');
        });
    }

    close(): void {
        const item: string = 'درخواست پشتیبانی';
        const title: string = this.ticket.title;
        const question: string = 'آیا می‌خواهید وضعیت درخواست مورد نظر را تغییر دهید؟';
        const message: string =
            'در صورت تایید، درخواست مورد نظر به صورت پاسخ داده شده در سیستم نمایش داده می‌شود. ' +
            'از این گزینه می‌توانید برای مواردی که لزومی برای ثبت پاسخ وجود ندارد اما می‌خوانید درخواست در لیست درخواست‌های پاسخ داده نشده نمایش داده نشود، استفاده کنید.';

        this.ngxHelperConfirmService.verify(
            { title: 'پاسخ داده شده', icon: 'task_alt' },
            item,
            { title, message, question },
            () => {
                const ID: string = this.ticket.id;
                this.apiService.request<ISupportTicketCloseRs>('SupportTicketClose', { ids: { ID } }, (response) => {
                    this.setTicket(response);
                    this.ngxHelperToastService.success('وضعیت درخواست پشتیبانی با موفقیت ثبت شد.');
                });
            },
        );
    }
}
