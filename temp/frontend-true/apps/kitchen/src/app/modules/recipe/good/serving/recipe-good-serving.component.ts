import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper, UnitLength, UnitVolume, UnitWeight } from '@webilix/helper-library';
import { INgxForm, INgxFormValues, NgxFormInputs } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { KitchenUnit, KitchenUnitInfo } from '@lib/shared';

@Component({
    host: { selector: 'recipe-good-serving' },
    standalone: false,
    templateUrl: './recipe-good-serving.component.html',
    styleUrl: './recipe-good-serving.component.scss',
})
export class RecipeGoodServingComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: this.data.serving ? 'ویرایش' : 'ثبت',
        inputs: [
            {
                inputs: [
                    { type: 'COMMENT', title: 'مواد غذایی', value: this.data.title },
                    { type: 'COMMENT', title: 'واحد', value: KitchenUnitInfo[this.data.unit].title },
                ],
                flex: [3],
            },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.serving?.description,
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            title: string;
            unit: KitchenUnit;
            serving?: { unit: string; value: number; description?: string };
        },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngOnInit(): void {
        const name: string = 'value';
        const title: string = 'مقدار برای هر وعده غذایی';
        let input: NgxFormInputs | null = null;
        switch (this.data.unit) {
            case 'WEIGHT':
                const wUnit: UnitWeight = this.data.serving
                    ? Helper.UNIT.WEIGHT.list.includes(this.data.serving.unit as UnitWeight)
                        ? (this.data.serving.unit as UnitWeight)
                        : 'GR'
                    : 'GR';
                input = { name, type: 'UNIT-WEIGHT', title, value: this.data.serving as any, unit: wUnit };
                break;

            case 'VOLUME':
                const vUnit: UnitVolume = this.data.serving
                    ? Helper.UNIT.VOLUME.list.includes(this.data.serving.unit as UnitVolume)
                        ? (this.data.serving.unit as UnitVolume)
                        : 'ML'
                    : 'ML';
                input = { name, type: 'UNIT-VOLUME', title, value: this.data.serving as any, unit: vUnit };
                break;

            case 'LENGTH':
                const lUnit: UnitLength = this.data.serving
                    ? Helper.UNIT.LENGTH.list.includes(this.data.serving.unit as UnitLength)
                        ? (this.data.serving.unit as UnitLength)
                        : 'CM'
                    : 'CM';
                input = { name, type: 'UNIT-LENGTH', title, value: this.data.serving as any, unit: lUnit };
                break;
            case 'COUNT':
                input = { name, type: 'NUMBER', title, value: this.data.serving?.value, suffix: 'عدد' };
                break;
        }

        if (input) {
            input = { ...input, minimum: 0.001, decimal: 3, autoFocus: true };
            this.ngxForm.inputs.splice(1, 0, input);
        }
    }

    ngxSubmit(values: INgxFormValues): void {
        const description: string = values['description'];
        switch (this.data.unit) {
            case 'WEIGHT':
                const valueW: { unit: string; value: number } = values['value'];
                this.ngxHelperBottomSheetService.close({ unit: valueW.unit, value: valueW.value, description });
                break;
            case 'VOLUME':
                const valueV: { unit: string; value: number } = values['value'];
                this.ngxHelperBottomSheetService.close({ unit: valueV.unit, value: valueV.value, description });
                break;
            case 'LENGTH':
                const valueL: { unit: string; value: number } = values['value'];
                this.ngxHelperBottomSheetService.close({ unit: valueL.unit, value: valueL.value, description });
                break;
            case 'COUNT':
                const valueC: number = values['value'];
                this.ngxHelperBottomSheetService.close({ unit: 'COUNT', value: valueC, description });
                break;
        }
    }
}
