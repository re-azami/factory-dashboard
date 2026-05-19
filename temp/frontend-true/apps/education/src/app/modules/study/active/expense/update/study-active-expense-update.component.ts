import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationExpenseDTO,
    IEducationExpenseUpdateRq,
    IEducationExpenseUpdateRs,
    IEducationStudyDTO,
} from '@lib/apis';
import { EducationExpenseInfo, EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active-expense-update' },
    templateUrl: './study-active-expense-update.component.html',
    styleUrl: './study-active-expense-update.component.scss',
    standalone: false
})
export class StudyActiveExpenseUpdateComponent {
    public ngxForm: INgxForm = {
        submit: `ویرایش هزینه ${EducationExpenseInfo[this.data.expense.type].title}`,
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            { name: 'date', type: 'DATE', value: this.data.expense.date, maxDate: new Date() },
            {
                name: 'expense',
                type: 'PRICE',
                title: 'هزینه',
                value: this.data.expense.expense,
                currency: 'تومان',
                showText: true,
                minimum: 1000,
            },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.expense.description,
                optional: this.data.expense.type !== 'OTHER',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO; expense: IEducationExpenseDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const STUDYID: string = this.data.study.id;
        const ID: string = this.data.expense.id;
        const body: IEducationExpenseUpdateRq = {
            type: this.data.expense.type,
            date: values['date'],
            expense: values['expense'],
            description: values['description'],
        };
        this.apiService.request<IEducationExpenseUpdateRs>('EducationExpenseUpdate', { body, ids: { STUDYID, ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
