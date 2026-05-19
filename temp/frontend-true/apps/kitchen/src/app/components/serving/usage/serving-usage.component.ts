import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormInputs, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IKitchenServingDTO,
    IKitchenServingGoodDTO,
    IKitchenServingUsageRq,
    IKitchenServingUsageRs,
} from '@lib/apis';
import { KitchenGood, KitchenGoodInfo, KitchenGoodList } from '@lib/shared';

import { KitchenUnitService } from '../../../providers';

@Component({
    host: { selector: 'serving-usage' },
    imports: [NgxFormModule],
    templateUrl: './serving-usage.component.html',
    styleUrl: './serving-usage.component.scss',
})
export class ServingUsageComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: 'ثبت',
        inputs: [],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { serving: IKitchenServingDTO; goods: IKitchenServingGoodDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    ngOnInit(): void {
        if (this.data.goods.length > 0) this.data.goods.forEach((good) => this.ngxForm.inputs.push(this.getInput(good)));
        else
            KitchenGoodList.forEach((good: KitchenGood) => {
                const goods: IKitchenServingGoodDTO[] = this.data.serving.goods.filter((g) => g.good === good);
                if (goods.length === 0) return;

                this.ngxForm.inputs.push(KitchenGoodInfo[good].title);
                const inputs = goods.map((g) => this.getInput(g));
                while (inputs.length > 0) this.ngxForm.inputs.push(inputs.splice(0, 2));
            });
    }

    getInput(good: IKitchenServingGoodDTO): NgxFormInputs {
        return this.kitchenUnitService.formInput(good.unit, `good_${good.id}`, {
            title: good.title,
            value: good.usage || undefined,
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.serving.id;
        const body: IKitchenServingUsageRq = { goods: [] };
        this.data.serving.goods.forEach((good) => {
            const value = this.kitchenUnitService.formValue(good.unit, values[`good_${good.id}`]);
            if (value) body.goods.push({ id: good.id, unit: value.unit, value: value.value });
        });
        this.apiService.request<IKitchenServingUsageRs>('KitchenServingUsage', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('میزان مصرف برنامه غذایی با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
