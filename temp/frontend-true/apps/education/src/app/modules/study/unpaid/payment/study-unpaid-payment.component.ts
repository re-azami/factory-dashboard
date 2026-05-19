import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import { ApiService, IEducationStudyDTO, IEducationStudyPaymentRq, IEducationStudyPaymentRs } from '@lib/apis';
import { EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-unpaid-payment' },
    templateUrl: './study-unpaid-payment.component.html',
    styleUrl: './study-unpaid-payment.component.scss',
    standalone: false
})
export class StudyUnpaidPaymentComponent {
    private pricePipe = new NgxHelperPricePipe().transform;
    public ngxForm: INgxForm = {
        submit: 'ثبت پرداخت هزینه برگزاری',
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            {
                type: 'COMMENT',
                title: 'هزینه برگزاری',
                value: this.pricePipe(this.data.study.expense.educator, { currency: 'تومان' }),
            },
            { name: 'date', type: 'DATE', title: 'تاریخ پرداخت', value: new Date(), maxDate: new Date() },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.study.id;
        const body: IEducationStudyPaymentRq = {
            date: values['date'],
            description: values['description'],
        };
        this.apiService.request<IEducationStudyPaymentRs>('EducationStudyPayment', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
