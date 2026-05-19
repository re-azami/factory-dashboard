import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationExpenseCreateRq, IEducationExpenseCreateRs, IEducationStudyDTO } from '@lib/apis';
import { EducationExpense, EducationExpenseInfo, EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active-expense-create' },
    templateUrl: './study-active-expense-create.component.html',
    styleUrl: './study-active-expense-create.component.scss',
    standalone: false
})
export class StudyActiveExpenseCreateComponent {
    public ngxForm: INgxForm = {
        submit: `ثبت هزینه ${EducationExpenseInfo[this.data.type].title}`,
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            { name: 'date', type: 'DATE', value: new Date(), maxDate: new Date() },
            {
                name: 'expense',
                type: 'PRICE',
                title: `هزینه ${EducationExpenseInfo[this.data.type].title}`,
                currency: 'تومان',
                showText: true,
                minimum: 1000,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: this.data.type !== 'OTHER' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO; type: EducationExpense },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const STUDYID: string = this.data.study.id;
        const body: IEducationExpenseCreateRq = {
            type: this.data.type,
            date: values['date'],
            expense: values['expense'],
            description: values['description'],
        };
        this.apiService.request<IEducationExpenseCreateRs>('EducationExpenseCreate', { body, ids: { STUDYID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
