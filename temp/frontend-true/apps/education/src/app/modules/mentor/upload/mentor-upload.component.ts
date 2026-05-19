import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationMentorDTO, IEducationMentorUploadRq, IEducationMentorUploadRs } from '@lib/apis';

@Component({
    host: { selector: 'mentor-upload' },
    templateUrl: './mentor-upload.component.html',
    styleUrl: './mentor-upload.component.scss',
    standalone: false
})
export class MentorUploadComponent {
    public ngxForm: INgxForm = {
        submit: 'آپلود رزومه مدرس',
        inputs: [
            { type: 'COMMENT', title: 'مدرس', value: `${this.data.mentor.name.first} ${this.data.mentor.name.last}` },
            {
                name: 'cv',
                type: 'FILE',
                title: 'فایل رزومه',
                mimes: ['application/pdf'],
                hint: 'فایل باید به فرمت پی‌دی‌اف باشد.',
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { mentor: IEducationMentorDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.apiService.upload('EDUCATION_MENTOR_CV', values['cv'], (response) => {
            const ID: string = this.data.mentor.id;
            const body: IEducationMentorUploadRq = { cv: response.path };
            this.apiService.request<IEducationMentorUploadRs>('EducationMentorUpload', { body, ids: { ID } }, () =>
                this.ngxHelperBottomSheetService.close(true),
            );
        });
    }
}
