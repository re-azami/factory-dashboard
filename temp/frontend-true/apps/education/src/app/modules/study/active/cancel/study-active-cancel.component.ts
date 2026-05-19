import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IEducationStudyCancelRq, IEducationStudyCancelRs, IEducationStudyDTO } from '@lib/apis';
import { EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active-cancel' },
    templateUrl: './study-active-cancel.component.html',
    styleUrl: './study-active-cancel.component.scss',
    standalone: false
})
export class StudyActiveCancelComponent {
    public ngxForm: INgxForm = {
        submit: 'لغو برگزاری دوره',
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                description: 'توضیحات در گزارش اطلاعات دوره نمایش داده می‌شود.',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO },
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.study.id;
        const body: IEducationStudyCancelRq = { description: values['description'] };
        this.apiService.request<IEducationStudyCancelRs>('EducationStudyCancel', { body, ids: { ID } }, () => {
            this.router.navigate(['/study', 'active']);
            this.ngxHelperToastService.success('برگزاری دوره با موفقیت لغو شد.');
            this.ngxHelperBottomSheetService.close();
        });
    }
}
