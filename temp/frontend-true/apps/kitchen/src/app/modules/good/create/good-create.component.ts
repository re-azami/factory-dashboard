import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { UnitLength, UnitVolume, UnitWeight } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IKitchenGoodCreateRq, IKitchenGoodCreateRs, IOptionDTO } from '@lib/apis';
import { KitchenGood, KitchenGoodInfo, KitchenUnit, KitchenUnitInfo, KitchenUnitList } from '@lib/shared';

@Component({
    host: { selector: 'good-create' },
    standalone: false,
    templateUrl: './good-create.component.html',
    styleUrl: './good-create.component.scss',
})
export class GoodCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت کالای جدید',
        inputs: [
            {
                type: 'COMMENT',
                title: 'نوع کالا',
                value: KitchenGoodInfo[this.data.good].title,
                description: KitchenGoodInfo[this.data.good].description,
            },
            {
                inputs: [
                    { name: 'title', type: 'TEXT', title: 'عنوان', autoFocus: true },
                    ...(KitchenGoodInfo[this.data.good].hasGroup
                        ? [{ name: 'group', type: 'SELECT' as 'SELECT', title: 'گروه', options: this.data.groups }]
                        : []),
                ],
                flex: [2],
            },
            {
                name: 'unit',
                type: 'GROUP',
                title: 'واحد محاسبات',
                groups: KitchenUnitList.map((unit: KitchenUnit) => ({
                    id: unit,
                    title: KitchenUnitInfo[unit].title,
                    icon: KitchenUnitInfo[unit].icon,
                })),
                minCount: 1,
                maxCount: 1,
                description: 'امکان تغییر واحد محاسبات پس از ثبت اطلاعات وجود ندارد.',
            },
            {
                inputs: [
                    {
                        name: 'inventory-weight',
                        type: 'UNIT-WEIGHT',
                        title: 'موجودی اولیه',
                        minimum: 0.001,
                        decimal: 3,
                        optional: true,
                        hideOn: (values) => !this.isUnit(values, 'WEIGHT'),
                    },
                    {
                        name: 'inventory-volume',
                        type: 'UNIT-VOLUME',
                        title: 'موجودی اولیه',
                        minimum: 0.001,
                        decimal: 3,
                        optional: true,
                        hideOn: (values) => !this.isUnit(values, 'VOLUME'),
                    },
                    {
                        name: 'inventory-length',
                        type: 'UNIT-LENGTH',
                        title: 'موجودی اولیه',
                        minimum: 0.001,
                        decimal: 3,
                        optional: true,
                        hideOn: (values) => !this.isUnit(values, 'LENGTH'),
                    },
                    {
                        name: 'inventory-count',
                        type: 'NUMBER',
                        title: 'موجودی اولیه',
                        suffix: 'عدد',
                        minimum: 1,
                        optional: true,
                        hideOn: (values) => !this.isUnit(values, 'COUNT'),
                    },
                ],
                flex: [],
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
            { name: 'dashboard', type: 'CHECKBOX', message: 'نمایش موجودی در داشبورد' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { good: KitchenGood; groups: IOptionDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    isUnit(values: INgxFormValues, unit: KitchenUnit): boolean {
        const units: KitchenUnit[] = values['unit'];
        if (!units || units.length !== 1 || !KitchenUnitList.includes(units[0])) return false;
        return units[0] === unit;
    }

    ngxSubmit(values: INgxFormValues): void {
        const unit: KitchenUnit = values['unit'][0];
        let inventory: { unit: string; value: number } | null = null;
        switch (unit) {
            case 'WEIGHT':
                const weight: { unit: UnitWeight; value: number } = values['inventory-weight'];
                if (!!weight && weight.value > 0) inventory = weight;
                break;
            case 'VOLUME':
                const volume: { unit: UnitVolume; value: number } = values['inventory-volume'];
                if (!!volume && volume.value > 0) inventory = volume;
                break;
            case 'LENGTH':
                const length: { unit: UnitLength; value: number } = values['inventory-length'];
                if (!!length && length.value > 0) inventory = length;
                break;
            case 'COUNT':
                const count: number = values['inventory-count'];
                if (!!count && count > 0) inventory = { unit: 'COUNT', value: count };
                break;
        }

        const body: IKitchenGoodCreateRq = {
            good: this.data.good,
            title: values['title'],
            group: KitchenGoodInfo[this.data.good].hasGroup ? values['group'] : null,
            unit,
            inventory,
            description: values['description'],
            dashboard: values['dashboard'],
        };
        this.apiService.request<IKitchenGoodCreateRs>('KitchenGoodCreate', { body }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
