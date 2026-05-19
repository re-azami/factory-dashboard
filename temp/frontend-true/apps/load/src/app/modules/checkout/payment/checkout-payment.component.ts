import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import { ApiService, ILoadCheckoutDTO, ILoadCheckoutPaymentRq, ILoadCheckoutPaymentRs } from '@lib/apis';

@Component({
    host: { selector: 'checkout-payment' },
    templateUrl: './checkout-payment.component.html',
    styleUrl: './checkout-payment.component.scss',
    standalone: false
})
export class CheckoutPaymentComponent {
    private periodPipe = new NgxHelperPeriodPipe();
    public ngxForm: INgxForm = {
        submit: 'ثبت پرداخت',
        inputs: [
            [
                {
                    type: 'COMMENT',
                    title: 'دوره زمانی',
                    value: this.periodPipe.transform({ from: this.data.checkout.date.from, to: this.data.checkout.date.to }),
                },
                { type: 'COMMENT', title: 'رسید پرداخت', value: this.data.checkout.code, english: true },
            ],
            [
                { type: 'COMMENT', title: 'تعداد بار', value: Helper.NUMBER.format(this.data.checkout.count.cargo) },
                { type: 'COMMENT', title: 'تعداد مالک', value: Helper.NUMBER.format(this.data.checkout.count.owner) },
                { type: 'COMMENT', title: 'تعداد حواله', value: Helper.NUMBER.format(this.data.checkout.count.draft) },
            ],
            { name: 'date', type: 'DATE', title: 'تاریخ پرداخت', maxDate: new Date() },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { checkout: ILoadCheckoutDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.checkout.id;
        const body: ILoadCheckoutPaymentRq = {
            date: values['date'],
            description: values['description'],
        };
        this.apiService.request<ILoadCheckoutPaymentRs>('LoadCheckoutPayment', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
