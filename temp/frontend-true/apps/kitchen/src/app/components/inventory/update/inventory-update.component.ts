import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IKitchenGoodDTO,
    IKitchenInventoryDTO,
    IKitchenInventoryUpdateRq,
    IKitchenInventoryUpdateRs,
} from '@lib/apis';
import { KitchenInventoryInfo } from '@lib/shared';

import { KitchenUnitService } from '../../../providers';

@Component({
    host: { selector: 'inventory-update' },
    imports: [NgxFormModule],
    templateUrl: './inventory-update.component.html',
    styleUrl: './inventory-update.component.scss',
})
export class InventoryUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش',
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
            { name: 'date', type: 'DATE', value: this.data.inventory.date, maxDate: new Date() },
            this.kitchenUnitService.formInput(this.data.good.unit, 'value', {
                value: this.data.inventory.value,
                descriotion:
                    this.data.inventory.type === 'RESET'
                        ? 'وزن مشخص شده به عنوان موجودی انبار در نظر گرفته می‌شود.'
                        : undefined,
            }),
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.inventory.description,
                optional: this.data.inventory.type === 'ENTER',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { good: IKitchenGoodDTO; inventory: IKitchenInventoryDTO },
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

        const ID: string = this.data.inventory.id;
        const body: IKitchenInventoryUpdateRq = {
            type: this.data.inventory.type,
            good: this.data.good.id,
            date: values['date'],
            value,
            description: values['description'],
        };
        this.apiService.request<IKitchenInventoryUpdateRs>('KitchenInventoryUpdate', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success(
                KitchenInventoryInfo[this.data.inventory.type].title + ' با موفقیت ویرایش شد.',
            );
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
