import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationLocationDTO, IEducationLocationUpdateRq, IEducationLocationUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'location-update' },
    templateUrl: './location-update.component.html',
    styleUrl: './location-update.component.scss',
    standalone: false
})
export class LocationUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش فضای آموزشی',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.location.title },
            {
                name: 'availability',
                type: 'CHECKBOX',
                message: 'فعال بودن سیستم بررسی زمانبندی',
                value: this.data.location.availability,
                description:
                    'در صورت انتخاب این گزینه، در هنگام ثبت دوره‌هایی که در این فضا برگزار می‌شوند، عدم تداخل زمانی دوره با سایر دوره‌های ثبت شده بررسی می‌شود ' +
                    'و در صورت وجود تداخل زمانی، امکان ثبت دوره جدید وجود نخواهد داشت و باید زمان دیگری برای برگزاری دوره انتخاب شود.',
            },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.location.description,
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { location: IEducationLocationDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.location.id;
        const body: IEducationLocationUpdateRq = {
            title: values['title'],
            availability: values['availability'],
            description: values['description'],
        };
        this.apiService.request<IEducationLocationUpdateRs>('EducationLocationUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
