import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IKitchenGoodDTO, IKitchenGoodInitialRq, IKitchenGoodInitialRs } from '@lib/apis';

import { KitchenUnitService } from '../../../providers';

@Component({
    host: { selector: 'inventory-initial' },
    imports: [NgxFormModule],
    templateUrl: './inventory-initial.component.html',
    styleUrl: './inventory-initial.component.scss',
})
export class InventoryInitialComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت',
        inputs: [
            { type: 'COMMENT', title: 'کالا', value: this.data.good.title },
            this.kitchenUnitService.formInput(this.data.good.unit, 'initial', {
                title: 'موجودی اولیه',
                value: this.data.good.initial || undefined,
                optional: true,
                descriotion: 'در صورت عدم مشخص کردن مقدار، موجودی اولیه برابر با صفر در نظر گرفته می‌شود.',
            }),
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { good: IKitchenGoodDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const initial = this.kitchenUnitService.formValue(this.data.good.unit, values['initial']);

        const ID: string = this.data.good.id;
        const body: IKitchenGoodInitialRq = { initial };
        this.apiService.request<IKitchenGoodInitialRs>('KitchenGoodInitial', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('موجودی اولیه با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
