import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationLocationCreateRq, IEducationLocationCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'location-create' },
    templateUrl: './location-create.component.html',
    styleUrl: './location-create.component.scss',
    standalone: false
})
export class LocationCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت فضای آموزشی جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            {
                name: 'availability',
                type: 'CHECKBOX',
                message: 'فعال بودن سیستم بررسی زمانبندی',
                description:
                    'در صورت انتخاب این گزینه، در هنگام ثبت دوره‌هایی که در این فضا برگزار می‌شوند، عدم تداخل زمانی دوره با سایر دوره‌های ثبت شده بررسی می‌شود ' +
                    'و در صورت وجود تداخل زمانی، امکان ثبت دوره جدید وجود نخواهد داشت و باید زمان دیگری برای برگزاری دوره انتخاب شود.',
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IEducationLocationCreateRq = {
            title: values['title'],
            availability: values['availability'],
            description: values['description'],
        };
        this.apiService.request<IEducationLocationCreateRs>('EducationLocationCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
