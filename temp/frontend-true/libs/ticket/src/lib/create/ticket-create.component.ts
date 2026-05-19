import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ISupportTicketAttachmentDTO, ISupportTicketUserCreateRq, ISupportTicketUserCreateRs } from '@lib/apis';
import { UserService } from '@lib/providers';
import { App, AppInfo, SupportRequest, SupportRequestInfo, SupportRequestList } from '@lib/shared';

@Component({
    host: { selector: 'ticket-create' },
    templateUrl: './ticket-create.component.html',
    styleUrl: './ticket-create.component.scss',
    standalone: false
})
export class TicketCreateComponent {
    public attachments: ISupportTicketAttachmentDTO[] = [];
    public ngxForm: INgxForm = {
        submit: 'ثبت درخواست پشتیبانی',
        inputs: [
            [
                { type: 'COMMENT', title: 'سرویس', value: AppInfo[this.data.app].title },
                {
                    type: 'COMMENT',
                    title: 'درخواست دهنده',
                    value: `${this.userService.user?.name.first || ''} ${this.userService.user?.name.last || ''}`,
                },
            ],
            {
                name: 'type',
                type: 'SELECT',
                title: 'نوع درخواست',
                options: SupportRequestList.map((request: SupportRequest) => ({
                    id: request,
                    title: SupportRequestInfo[request].title,
                })),
            },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'ticket', type: 'TEXTAREA', title: 'درخواست', autoHeight: true, maxHeight: 250 },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { app: App },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ISupportTicketUserCreateRq = {
            app: this.data.app,
            type: values['type'],
            title: values['title'],
            ticket: values['ticket'],
            attachments: this.attachments,
        };
        this.apiService.request<ISupportTicketUserCreateRs>('SupportTicketUserCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
