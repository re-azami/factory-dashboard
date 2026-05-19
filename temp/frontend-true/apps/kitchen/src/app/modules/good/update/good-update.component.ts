import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IKitchenGoodDTO, IKitchenGoodUpdateRq, IKitchenGoodUpdateRs, IOptionDTO } from '@lib/apis';
import { KitchenGoodInfo, KitchenUnitInfo } from '@lib/shared';

@Component({
    host: { selector: 'good-update' },
    standalone: false,
    templateUrl: './good-update.component.html',
    styleUrl: './good-update.component.scss',
})
export class GoodUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش کالا',
        inputs: [
            {
                type: 'COMMENT',
                title: 'نوع کالا',
                value: KitchenGoodInfo[this.data.good.good].title,
                description: KitchenGoodInfo[this.data.good.good].description,
            },
            {
                inputs: [
                    { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.good.title, autoFocus: true },
                    ...(KitchenGoodInfo[this.data.good.good].hasGroup
                        ? [
                              {
                                  name: 'group',
                                  type: 'SELECT' as 'SELECT',
                                  title: 'گروه',
                                  value: this.data.good.group?.id,
                                  options: this.data.groups,
                              },
                          ]
                        : []),
                ],
                flex: [2],
            },
            { type: 'COMMENT', title: 'واحد محاسبات', value: KitchenUnitInfo[this.data.good.unit].title },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', value: this.data.good.description, optional: true },
            { name: 'dashboard', type: 'CHECKBOX', message: 'نمایش موجودی در داشبورد', value: this.data.good.dashboard },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { good: IKitchenGoodDTO; groups: IOptionDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.good.id;
        const body: IKitchenGoodUpdateRq = {
            good: this.data.good.good,
            title: values['title'],
            group: KitchenGoodInfo[this.data.good.good].hasGroup ? values['group'] : null,
            unit: this.data.good.unit,
            description: values['description'],
            dashboard: values['dashboard'],
        };
        this.apiService.request<IKitchenGoodUpdateRs>('KitchenGoodUpdate', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
