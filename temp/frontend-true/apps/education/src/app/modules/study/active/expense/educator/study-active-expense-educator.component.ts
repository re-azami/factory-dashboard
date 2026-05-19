import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationStudyDTO, IEducationStudyExpenseRq, IEducationStudyExpenseRs } from '@lib/apis';
import { EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active-expense-educator' },
    templateUrl: './study-active-expense-educator.component.html',
    styleUrl: './study-active-expense-educator.component.scss',
    standalone: false
})
export class StudyActiveExpenseEducatorComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش هزینه برگزاری دوره',
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            {
                name: 'expense',
                type: 'PRICE',
                title: 'هزینه برگزاری',
                value: this.data.study.expense.educator,
                currency: 'تومان',
                showText: true,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.study.id;
        const body: IEducationStudyExpenseRq = {
            expense: values['expense'],
            description: values['description'],
        };
        this.apiService.request<IEducationStudyExpenseRs>('EducationStudyExpense', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
