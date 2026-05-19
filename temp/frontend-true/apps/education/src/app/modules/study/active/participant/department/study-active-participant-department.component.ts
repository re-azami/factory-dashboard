import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationStudyDTO,
    IEducationStudyDataRs,
    IEducationStudyDepartmentRq,
    IEducationStudyDepartmentRs,
} from '@lib/apis';
import { EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active-participant-department' },
    templateUrl: './study-active-participant-department.component.html',
    styleUrl: './study-active-participant-department.component.scss',
    standalone: false
})
export class StudyActiveParticipantDepartmentComponent {
    public ngxForm: INgxForm = {
        submit: 'تغییر واحدهای مرتبط',
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            {
                name: 'department',
                type: 'MULTI-SELECT',
                title: 'واحدهای مرتبط',
                value: this.data.study.department.map((d) => d.id),
                options: this.data.data.departments,
                description:
                    'در صورت انتخاب مقدار برای این گزینه، فقط پرسنل مربوط به واحد‌های مشخص شده امکان شرکت در این دوره را خواهند داشت.',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { study: IEducationStudyDTO; data: IEducationStudyDataRs },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.study.id;
        const body: IEducationStudyDepartmentRq = { department: values['department'] };
        this.apiService.request<IEducationStudyDepartmentRs>('EducationStudyDepartment', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
