import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IKitchenServingDTO, IKitchenServingServeRq, IKitchenServingServeRs } from '@lib/apis';
import { KitchenMealInfo } from '@lib/shared';

@Component({
    host: { selector: 'serving-serve' },
    imports: [NgxFormModule],
    templateUrl: './serving-serve.component.html',
    styleUrl: './serving-serve.component.scss',
})
export class ServingServeComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت',
        inputs: [
            {
                inputs: [
                    { type: 'COMMENT', title: 'تاریخ', value: JalaliDateTime().toTitle(this.data.serving.date) },
                    { type: 'COMMENT', title: 'وعده غذایی', value: KitchenMealInfo[this.data.serving.meal].title },
                ],
                flex: [2],
            },
            {
                name: 'serving',
                type: 'NUMBER',
                title: 'تعداد سرو',
                value: this.data.serving.serving,
                minimum: 1,
                autoFocus: true,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { serving: IKitchenServingDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.serving.id;
        const body: IKitchenServingServeRq = {
            serving: values['serving'],
            description: values['description'],
        };
        this.apiService.request<IKitchenServingServeRs>('KitchenServingServe', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('تعداد سرو با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
