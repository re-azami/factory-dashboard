import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ILaboratorySolidTestDTO } from '@lib/apis';
import { LaboratorySolid, LaboratorySolidInfo } from '@lib/shared';

@Component({
    host: { selector: 'test-solid' },
    imports: [NgxFormModule],
    templateUrl: './test-solid.component.html',
    styleUrl: './test-solid.component.scss'
})
export class TestSolidComponent {
    public density?: number = this.data.solid?.density;
    public result?: number = this.data.solid?.result;
    public ngxForm: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs: [
            [
                {
                    name: 'container-weight',
                    type: 'NUMBER',
                    title: 'وزن ظرف خالی',
                    value: this.data.solid?.container.weight,
                    decimal: 4,
                    autoFocus: true,
                },
                {
                    name: 'container-pulp',
                    type: 'NUMBER',
                    title: 'وزن پالپ + ظرف',
                    value: this.data.solid?.container.pulp,
                    decimal: 4,
                    autoFocus: true,
                },
            ],
            [
                {
                    name: 'oven-weight',
                    type: 'NUMBER',
                    title: 'وزن ظرف آون',
                    value: this.data.solid?.oven.weight,
                    decimal: 4,
                    autoFocus: true,
                },
                {
                    name: 'oven-solid',
                    type: 'NUMBER',
                    title: 'وزن جامد + ظرف آون',
                    value: this.data.solid?.oven.solid,
                    decimal: 4,
                    autoFocus: true,
                },
            ],
            `نتایج ${LaboratorySolidInfo[this.data.test].title}`,
            [
                { type: 'COMMENT', title: 'وزن پالپ', value: '', english: true, onChange: this.setPulp.bind(this) },
                { type: 'COMMENT', title: 'وزن جامد', value: '', english: true, onChange: this.setSolid.bind(this) },
                { type: 'COMMENT', title: 'دانسیته', value: '', english: true, onChange: this.setDensity.bind(this) },
            ],
            { type: 'COMMENT', title: 'درصد جامد', value: '', english: true, onChange: this.setResult.bind(this) },
        ],
        buttons: [
            {
                title: 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { test: LaboratorySolid; solid?: ILaboratorySolidTestDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
    ) {}

    getPulp(values: INgxFormValues): number | null {
        const weight: number = values['container-weight'];
        const pulp: number = values['container-pulp'];

        if (isNaN(weight) || weight <= 0 || isNaN(pulp) || pulp <= 0 || pulp <= weight) return null;
        return +(pulp - weight).toFixed(3);
    }

    setPulp(values: INgxFormValues): string | null {
        return this.getPulp(values)?.toString() || null;
    }

    getSolid(values: INgxFormValues): number | null {
        const weight: number = values['oven-weight'];
        const solid: number = values['oven-solid'];

        if (isNaN(weight) || weight <= 0 || isNaN(solid) || solid <= 0 || solid <= weight) return null;
        return +(solid - weight).toFixed(3);
    }

    setSolid(values: INgxFormValues): string | null {
        return this.getSolid(values)?.toString() || null;
    }

    setDensity(values: INgxFormValues): string | null {
        this.density = undefined;

        const pulp: number | null = this.getPulp(values);
        if (pulp === null) return null;

        this.density = +(pulp / 800).toFixed(3);
        return this.density.toString();
    }

    setResult(values: INgxFormValues): string | null {
        this.result = undefined;

        const pulp: number | null = this.getPulp(values);
        const solid: number | null = this.getSolid(values);
        if (pulp === null || solid === null) return null;

        this.result = +((solid / pulp) * 100).toFixed(3);
        return this.result.toString();
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.result || this.density === undefined) return;

        if (this.result > 100) {
            this.ngxHelperToastService.error('مقدار نتیجه آزمایش نمی‌تواند بزرگتر از ۱۰۰ باشد.');
            return;
        }

        const solid: ILaboratorySolidTestDTO = {
            test: this.data.test,
            container: { weight: values['container-weight'], pulp: values['container-pulp'] },
            oven: { weight: values['oven-weight'], solid: values['oven-solid'] },
            density: this.density,
            result: this.result,
        };
        this.ngxHelperBottomSheetService.close({ solid });
    }
}
