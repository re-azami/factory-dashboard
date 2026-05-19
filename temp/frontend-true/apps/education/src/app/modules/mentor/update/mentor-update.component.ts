import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationMentorDTO, IEducationMentorUpdateRq, IEducationMentorUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'mentor-update' },
    templateUrl: './mentor-update.component.html',
    styleUrl: './mentor-update.component.scss',
    standalone: false
})
export class MentorUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش مدرس',
        inputs: [
            { name: 'name', type: 'NAME', value: this.data.mentor.name },
            [
                { name: 'mobile', type: 'MOBILE', value: this.data.mentor.mobile, optional: true },
                { name: 'nationalCode', type: 'NATIONAL-CODE', value: this.data.mentor.nationalCode, optional: true },
            ],
            { name: 'introducer', type: 'TEXT', title: 'معرف', value: this.data.mentor.introducer, optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { mentor: IEducationMentorDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.mentor.id;
        const body: IEducationMentorUpdateRq = {
            name: values['name'],
            mobile: values['mobile'],
            nationalCode: values['nationalCode'],
            introducer: values['introducer'],
        };
        this.apiService.request<IEducationMentorUpdateRs>('EducationMentorUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
