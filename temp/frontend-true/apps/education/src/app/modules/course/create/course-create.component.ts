import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationCourseCreateRq, IEducationCourseCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'course-create' },
    templateUrl: './course-create.component.html',
    styleUrl: './course-create.component.scss',
    standalone: false
})
export class CourseCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت دوره جدید',
        inputs: [
            {
                name: 'code',
                type: 'TEXT',
                title: 'کد شناسایی',
                minLength: 3,
                maxLength: 3,
                english: true,
                pattern: { regex: /^[A-Z][A-Z0-9]{2}$/ },
                description:
                    'از کد شناسایی برای ایجاد کدهای برگزاری دوره استفاده می‌شود.' +
                    ' کد شناسایی هر دوره باید یک مقدار اختصاصی و شامل سه حرف باشد و موارد زیر باید در مشخص کردن مقدار رعایت شده باشد.' +
                    '\n- مقدار می‌تواند فقط شامل حروف انگلیسی بزرگ و اعداد انگلیسی باشد.' +
                    '\n- مقدار باید با یک حروف انگلیسی بزرگ شروع شده باشد.',
            },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IEducationCourseCreateRq = {
            code: values['code'],
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<IEducationCourseCreateRs>('EducationCourseCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
