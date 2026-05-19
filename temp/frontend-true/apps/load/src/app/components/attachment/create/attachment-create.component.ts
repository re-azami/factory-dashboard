import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadAttachmentCreateRq, ILoadAttachmentCreateRs } from '@lib/apis';
import { LoadAttachment, LoadAttachmentInfo } from '@lib/shared';

@Component({
    host: { selector: 'attachment-create' },
    imports: [NgxFormModule],
    templateUrl: './attachment-create.component.html',
    styleUrl: './attachment-create.component.scss'
})
export class AttachmentCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'آپلود',
        inputs: [
            { type: 'COMMENT', title: LoadAttachmentInfo[this.data.type].title, value: this.data.data.title },
            {
                inputs: [
                    { name: 'title', type: 'TEXT', title: 'عنوان' },
                    { name: 'code', type: 'TEXT', title: 'کد', english: true, optional: true },
                ],
                flex: [1, 0.5],
            },
            { name: 'file', type: 'FILE', title: 'فایل ضمیمه' },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { type: LoadAttachment; data: { id: string; title: string } },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.apiService.upload('LOAD_ATTACHMENT', values['file'], (file) => {
            const body: ILoadAttachmentCreateRq = {
                attachment: this.data.type,
                data: this.data.data.id,
                title: values['title'],
                code: values['code'],
                file,
                description: values['description'],
            };
            this.apiService.request<ILoadAttachmentCreateRs>('LoadAttachmentCreate', { body }, () =>
                this.ngxHelperBottomSheetService.close(true),
            );
        });
    }
}
