import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ILaboratoryTestFeODTO } from '@lib/apis';
import { LaboratoryResultInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'test-feo' },
    imports: [NgxFormModule],
    templateUrl: './test-feo.component.html',
    styleUrl: './test-feo.component.scss'
})
export class TestFeoComponent implements OnInit {
    public result?: number = this.data.feo?.result;
    public ngxForm: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs: [
            [
                {
                    name: 'weight',
                    type: 'NUMBER',
                    title: 'وزن',
                    value: this.data.feo?.weight || undefined,
                    decimal: 4,
                    autoFocus: true,
                    id: 'ID-input-0',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(0, event),
                    },
                },
                {
                    name: 'volume',
                    type: 'NUMBER',
                    title: 'حجم',
                    value: this.data.feo?.volume || undefined,
                    decimal: 4,
                    id: 'ID-input-1',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(1, event),
                    },
                },
                {
                    name: 'standard',
                    type: 'NUMBER',
                    title: 'استاندارد',
                    value: this.data.feo?.standard || this.data.standard || undefined,
                    decimal: 4,
                    id: 'ID-input-2',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(2, event),
                    },
                },
            ],
            {
                type: 'COMMENT',
                title: LaboratoryResultInfo['FEO'].title,
                value: this.data.feo?.result.toString() || '',
                english: true,
                onChange: this.setResult.bind(this),
            },
        ],
        buttons: [
            {
                title: this.data.feo && !this.data.test ? 'حذف مقدار' : 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: { standard: number; feo?: ILaboratoryTestFeODTO; test?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngOnInit(): void {
        if (this.data.test) this.ngxForm.inputs.unshift({ type: 'COMMENT', title: 'آزمایش', value: this.data.test });
    }

    setResult(values: INgxFormValues): string | null {
        this.result = undefined;

        const weight: number = values['weight'];
        const volume: number = values['volume'];
        const standard: number = values['standard'];
        if (isNaN(weight) || weight <= 0 || isNaN(volume) || volume <= 0 || isNaN(standard) || standard <= 0) return null;

        this.result = +((volume / weight) * 1.2865 * standard).toFixed(2);
        return this.result.toString();
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.result) return;

        if (this.result > 100) {
            this.ngxHelperToastService.error('مقدار نتیجه آزمایش نمی‌تواند بزرگتر از ۱۰۰ باشد.');
            return;
        }

        const feo: ILaboratoryTestFeODTO = {
            weight: values['weight'],
            volume: values['volume'],
            standard: values['standard'],
            result: this.result,
        };
        this.ngxHelperBottomSheetService.close({ feo });
    }
}
