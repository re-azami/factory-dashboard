import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IEducationCourseCodeRq, IEducationCourseCodeRs, IEducationCourseDTO } from '@lib/apis';

@Component({
    host: { selector: 'course-code' },
    templateUrl: './course-code.component.html',
    styleUrl: './course-code.component.scss',
    standalone: false
})
export class CourseCodeComponent {
    public ngxForm: INgxForm = {
        submit: 'تغییر کد شناسایی دوره',
        inputs: [
            {
                inputs: [
                    { type: 'COMMENT', title: 'دوره', value: this.data.course.title },
                    { type: 'COMMENT', title: 'کد شناسایی فعلی', value: this.data.course.code, english: true },
                ],
                flex: [2],
            },
            {
                name: 'code',
                type: 'TEXT',
                title: 'کد شناسایی جدید',
                minLength: 3,
                maxLength: 3,
                english: true,
                pattern: { regex: /^[A-Z][A-Z0-9]{2}$/ },
                description:
                    'از کد شناسایی برای ایجاد کدهای برگزاری دوره استفاده می‌شود.' +
                    ' کد شناسایی هر دوره باید یک مقدار اختصاصی و شامل سه حرف باشد و موارد زیر باید در مشخص کردن مقدار رعایت شده باشد.' +
                    '\n- مقدار می‌تواند فقط شامل حروف انگلیسی بزرگ و اعداد انگلیسی باشد.' +
                    '\n- مقدار باید با یک حروف انگلیسی بزرگ شروع شده باشد.' +
                    '\n\nتغییر کد باعت ایجاد تغییر در کد برگزاری دوره‌های ثبت شده در سیستم نمی‌شود.',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { course: IEducationCourseDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        if (values['code'] === this.data.course.code) {
            this.ngxHelperToastService.error('کد شناسایی جدید نمی‌نواند برابر با کد شناسایی فعلی باشد.');
            return;
        }

        const ID: string = this.data.course.id;
        const body: IEducationCourseCodeRq = {
            code: values['code'],
        };
        this.apiService.request<IEducationCourseCodeRs>('EducationCourseCode', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
