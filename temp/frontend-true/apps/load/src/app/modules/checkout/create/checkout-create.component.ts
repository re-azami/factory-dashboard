import { Component } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadCheckoutCreateRq, ILoadCheckoutCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'checkout-create' },
    templateUrl: './checkout-create.component.html',
    styleUrl: './checkout-create.component.scss',
    standalone: false
})
export class CheckoutCreateComponent {
    private date: Date = new Date(new Date().getTime() - 24 * 3600 * 1000);
    public ngxForm: INgxForm = {
        submit: 'ثبت رسید پرداخت',
        inputs: [
            [
                { name: 'start', type: 'DATE', title: 'تاریخ شروع', maxDate: this.date },
                { name: 'end', type: 'DATE', title: 'تاریخ پایان', maxDate: this.date },
            ],
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    public period?: { from: Date; to: Date };
    public error: boolean = false;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxChange(values: INgxFormValues): void {
        const jalali = JalaliDateTime();
        const from: Date | undefined = values['start'] ? jalali.periodDay(1, values['start']).from : undefined;
        const to: Date | undefined = values['end'] ? jalali.periodDay(1, values['end']).to : undefined;

        this.error = false;
        this.period = undefined;
        if (!from || !to) return;

        if (from.getTime() > to.getTime()) this.error = true;
        else this.period = { from, to };
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.period) return;

        const body: ILoadCheckoutCreateRq = {
            from: this.period.from,
            to: this.period.to,
            description: values['description'],
        };
        this.apiService.request<ILoadCheckoutCreateRs>('LoadCheckoutCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
