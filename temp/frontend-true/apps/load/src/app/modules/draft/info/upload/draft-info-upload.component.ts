import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftAttachmentCreateRq, ILoadDraftAttachmentCreateRs, ILoadDraftDTO } from '@lib/apis';

@Component({
    host: { selector: 'draft-info-upload' },
    templateUrl: './draft-info-upload.component.html',
    styleUrl: './draft-info-upload.component.scss',
    standalone: false
})
export class DraftInfoUploadComponent {
    public ngxForm: INgxForm = {
        submit: 'آپلود',
        inputs: [
            { type: 'COMMENT', title: 'حواله', value: this.data.draft.code, english: true },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'file', type: 'FILE', title: 'فایل ضمیمه' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.apiService.upload('LOAD_DRAFT', values['file'], (upload) => {
            const ID: string = this.data.draft.id;
            const body: ILoadDraftAttachmentCreateRq = {
                title: values['title'],
                file: { path: upload.path, mime: upload.mime, size: upload.size },
            };
            this.apiService.request<ILoadDraftAttachmentCreateRs>(
                'LoadDraftAttachmentCreate',
                { body, ids: { ID } },
                (response) => this.ngxHelperBottomSheetService.close(response),
            );
        });
    }
}
