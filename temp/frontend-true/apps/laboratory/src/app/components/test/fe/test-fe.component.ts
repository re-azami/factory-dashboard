import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ILaboratoryTestFeDTO } from '@lib/apis';
import { LaboratoryResultInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'test-fe' },
    imports: [NgxFormModule],
    templateUrl: './test-fe.component.html',
    styleUrl: './test-fe.component.scss'
})
export class TestFeComponent implements OnInit {
    public result?: number = this.data.fe?.result;
    public ngxForm: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs: [
            [
                {
                    name: 'weight',
                    type: 'NUMBER',
                    title: 'وزن',
                    value: this.data.fe?.weight || undefined,
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
                    value: this.data.fe?.volume || undefined,
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
                    value: this.data.fe?.standard || this.data.standard || undefined,
                    decimal: 4,
                    id: 'ID-input-2',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(2, event),
                    },
                },
            ],
            {
                type: 'COMMENT',
                title: LaboratoryResultInfo['FE'].title,
                value: this.data.fe?.result.toString() || '',
                english: true,
                onChange: this.setResult.bind(this),
            },
        ],
        buttons: [
            {
                title: this.data.fe && !this.data.test ? 'حذف مقدار' : 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: { standard: number; fe?: ILaboratoryTestFeDTO; test?: string },
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

        this.result = +((volume / weight) * standard).toFixed(2);
        return this.result.toString();
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.result) return;

        if (this.result > 100) {
            this.ngxHelperToastService.error('مقدار نتیجه آزمایش نمی‌تواند بزرگتر از ۱۰۰ باشد.');
            return;
        }

        const fe: ILaboratoryTestFeDTO = {
            weight: values['weight'],
            volume: values['volume'],
            standard: values['standard'],
            result: this.result,
        };
        this.ngxHelperBottomSheetService.close({ fe });
    }
}
