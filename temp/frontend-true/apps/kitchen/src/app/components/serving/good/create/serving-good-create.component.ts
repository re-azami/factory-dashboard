import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IKitchenGoodDTO,
    IKitchenServingDTO,
    IKitchenServingGoodCreateRq,
    IKitchenServingGoodCreateRs,
} from '@lib/apis';
import { KitchenGoodInfo } from '@lib/shared';

import { KitchenUnitService } from '../../../../providers';

@Component({
    host: { selector: 'serving-good-create' },
    imports: [NgxFormModule],
    templateUrl: './serving-good-create.component.html',
    styleUrl: './serving-good-create.component.scss',
})
export class ServingGoodCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت',
        inputs: [
            { type: 'COMMENT', title: KitchenGoodInfo[this.data.good.good].title, value: this.data.good.title },
            this.kitchenUnitService.formInput(this.data.good.unit, 'usage', {
                title: 'میزان مصرف',
                optional: !this.data.serving.isServed,
            }),
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { serving: IKitchenServingDTO; good: IKitchenGoodDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const usage = this.kitchenUnitService.formValue(this.data.good.unit, values['usage']);
        if (this.data.serving.isServed && usage === null) {
            this.ngxHelperToastService.error('میزان مصرف مشخص نشده است.');
            return;
        }

        const SERVINGID: string = this.data.serving.id;
        const body: IKitchenServingGoodCreateRq = {
            good: this.data.good.id,
            usage,
            description: values['description'],
        };
        this.apiService.request<IKitchenServingGoodCreateRs>(
            'KitchenServingGoodCreate',
            { body, ids: { SERVINGID } },
            (response) => {
                this.ngxHelperToastService.success(`${KitchenGoodInfo[this.data.good.good].title} با موفقیت ثبت شد.`);
                this.ngxHelperBottomSheetService.close(response);
            },
        );
    }
}
