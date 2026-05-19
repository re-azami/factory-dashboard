import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ILaboratoryTestMoistureDTO } from '@lib/apis';
import { LaboratoryResultInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'test-moisture' },
    imports: [NgxFormModule],
    templateUrl: './test-moisture.component.html',
    styleUrl: './test-moisture.component.scss'
})
export class TestMoistureComponent implements OnInit {
    public result?: number = this.data.moisture?.result;
    public ngxForm: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs: [
            [
                {
                    name: 'empty',
                    type: 'NUMBER',
                    title: 'خالی',
                    value: this.data.moisture?.empty || undefined,
                    decimal: 4,
                    autoFocus: true,
                    id: 'ID-input-0',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(0, event),
                    },
                },
                {
                    name: 'initial',
                    type: 'NUMBER',
                    title: 'اولیه',
                    value: this.data.moisture?.initial || undefined,
                    decimal: 4,
                    id: 'ID-input-1',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(1, event),
                    },
                },
                {
                    name: 'final',
                    type: 'NUMBER',
                    title: 'نهایی',
                    value: this.data.moisture?.final || undefined,
                    decimal: 4,
                    id: 'ID-input-2',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(2, event),
                    },
                },
            ],
            {
                type: 'COMMENT',
                title: LaboratoryResultInfo['MOISTURE'].title,
                value: this.data.moisture?.result.toString() || '',
                english: true,
                onChange: this.setResult.bind(this),
            },
        ],
        buttons: [
            {
                title: this.data.moisture && !this.data.test ? 'حذف مقدار' : 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: { moisture?: ILaboratoryTestMoistureDTO; test?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngOnInit(): void {
        if (this.data.test) this.ngxForm.inputs.unshift({ type: 'COMMENT', title: 'آزمایش', value: this.data.test });
    }

    setResult(values: INgxFormValues): string | null {
        this.result = undefined;

        const empty: number = values['empty'];
        const initial: number = values['initial'];
        const final: number = values['final'];
        if (
            isNaN(empty) ||
            empty <= 0 ||
            isNaN(initial) ||
            initial <= 0 ||
            isNaN(final) ||
            final <= 0 ||
            initial - final <= 0 ||
            initial - empty <= 0
        )
            return null;

        this.result = +(((initial - final) / (initial - empty)) * 100).toFixed(2);
        return this.result.toString();
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.result) return;

        if (this.result > 100) {
            this.ngxHelperToastService.error('مقدار نتیجه آزمایش نمی‌تواند بزرگتر از ۱۰۰ باشد.');
            return;
        }

        const moisture: ILaboratoryTestMoistureDTO = {
            empty: values['empty'],
            initial: values['initial'],
            final: values['final'],
            result: this.result,
        };
        this.ngxHelperBottomSheetService.close({ moisture });
    }
}
