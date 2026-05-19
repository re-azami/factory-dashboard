import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationMentorCreateRq, IEducationMentorCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'mentor-create' },
    templateUrl: './mentor-create.component.html',
    styleUrl: './mentor-create.component.scss',
    standalone: false
})
export class MentorCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت مدرس جدید',
        inputs: [
            { name: 'name', type: 'NAME' },
            [
                { name: 'mobile', type: 'MOBILE', optional: true },
                { name: 'nationalCode', type: 'NATIONAL-CODE', optional: true },
            ],
            { name: 'introducer', type: 'TEXT', title: 'معرف', optional: true },
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
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    save(values: INgxFormValues, cv?: string): void {
        const body: IEducationMentorCreateRq = {
            name: values['name'],
            mobile: values['mobile'],
            nationalCode: values['nationalCode'],
            introducer: values['introducer'],
            cv: cv || values['cv'],
        };
        this.apiService.request<IEducationMentorCreateRs>('EducationMentorCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!values['cv']) this.save(values);
        else this.apiService.upload('EDUCATION_MENTOR_CV', values['cv'], (response) => this.save(values, response.path));
    }
}
