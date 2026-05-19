import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IKitchenGoodDTO, IKitchenInventoryCreateRq, IKitchenInventoryCreateRs } from '@lib/apis';
import { KitchenInventory, KitchenInventoryInfo } from '@lib/shared';

import { KitchenUnitService } from '../../../providers';

@Component({
    host: { selector: 'inventory-create' },
    imports: [NgxFormModule],
    templateUrl: './inventory-create.component.html',
    styleUrl: './inventory-create.component.scss',
})
export class InventoryCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت',
        inputs: [
            {
                inputs: [
                    { type: 'COMMENT', title: 'کالا', value: this.data.good.title },
                    {
                        type: 'COMMENT',
                        title: 'موجودی',
                        value: this.kitchenUnitService.valueTitle(this.data.good.unit, this.data.good.inventory),
                    },
                ],
                flex: [2],
            },
            { name: 'date', type: 'DATE', value: new Date(), maxDate: new Date() },
            this.kitchenUnitService.formInput(this.data.good.unit, 'value', {
                descriotion:
                    this.data.type === 'RESET' ? 'وزن مشخص شده به عنوان موجودی انبار در نظر گرفته می‌شود.' : undefined,
            }),
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: this.data.type === 'ENTER' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { good: IKitchenGoodDTO; type: KitchenInventory },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const value = this.kitchenUnitService.formValue(this.data.good.unit, values['value']);
        if (value === null) {
            this.ngxHelperToastService.error('مقدار به صورت صحیح مشخص مشده است.');
            return;
        }

        const body: IKitchenInventoryCreateRq = {
            type: this.data.type,
            good: this.data.good.id,
            date: values['date'],
            value,
            description: values['description'],
        };
        this.apiService.request<IKitchenInventoryCreateRs>('KitchenInventoryCreate', { body }, (response) => {
            this.ngxHelperToastService.success(KitchenInventoryInfo[this.data.type].title + ' با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
