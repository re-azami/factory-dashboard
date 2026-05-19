import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadAttachmentDTO, ILoadAttachmentUpdateRq, ILoadAttachmentUpdateRs, IUploadRs } from '@lib/apis';
import { LoadAttachment, LoadAttachmentInfo } from '@lib/shared';

@Component({
    host: { selector: 'attachment-update' },
    imports: [NgxFormModule],
    templateUrl: './attachment-update.component.html',
    styleUrl: './attachment-update.component.scss'
})
export class AttachmentUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش',
        inputs: [
            { type: 'COMMENT', title: LoadAttachmentInfo[this.data.type].title, value: this.data.data.title },
            {
                inputs: [
                    { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.attachment.title },
                    {
                        name: 'code',
                        type: 'TEXT',
                        title: 'کد',
                        value: this.data.attachment.code,
                        english: true,
                        optional: true,
                    },
                ],
                flex: [1, 0.5],
            },
            {
                name: 'file',
                type: 'FILE',
                title: 'فایل ضمیمه',
                optional: true,
                description: 'در صورت انتخاب نکردن فایل جدید، فقط عنوان و توضیحات فایل ویرایش خواهد شد.',
            },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.attachment.description,
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { type: LoadAttachment; data: { id: string; title: string }; attachment: ILoadAttachmentDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    upload(file: File): Promise<IUploadRs> {
        return new Promise<IUploadRs>((resolve) => {
            if (!file) {
                resolve(this.data.attachment.file);
                return;
            }

            this.apiService.upload('LOAD_ATTACHMENT', file, (upload) => resolve(upload));
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        this.upload(values['file']).then((file) => {
            const ID: string = this.data.attachment.id;
            const body: ILoadAttachmentUpdateRq = {
                attachment: this.data.type,
                data: this.data.data.id,
                title: values['title'],
                code: values['code'],
                file,
                description: values['description'],
            };
            this.apiService.request<ILoadAttachmentUpdateRs>('LoadAttachmentUpdate', { body, ids: { ID } }, () =>
                this.ngxHelperBottomSheetService.close(true),
            );
        });
    }
}
