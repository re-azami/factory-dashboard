import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ILaboratoryTestSulphurDTO } from '@lib/apis';
import { LaboratoryResultInfo } from '@lib/shared';

@Component({
    host: { selector: 'test-sulphur' },
    imports: [NgxFormModule],
    templateUrl: './test-sulphur.component.html',
    styleUrl: './test-sulphur.component.scss'
})
export class TestSulphurComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs: [
            {
                name: 'result',
                type: 'NUMBER',
                title: LaboratoryResultInfo['SULPHUR'].title,
                value: this.data.sulphur?.result || undefined,
                minimum: 0,
                maximum: 100,
                decimal: 4,
                suffix: 'درصد',
                autoFocus: true,
            },
        ],
        buttons: [
            {
                title: this.data.sulphur && !this.data.test ? 'حذف مقدار' : 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: { sulphur?: ILaboratoryTestSulphurDTO; test?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngOnInit(): void {
        if (this.data.test) this.ngxForm.inputs.unshift({ type: 'COMMENT', title: 'آزمایش', value: this.data.test });
    }

    ngxSubmit(values: INgxFormValues): void {
        const sulphur: ILaboratoryTestSulphurDTO = {
            result: values['result'],
        };
        this.ngxHelperBottomSheetService.close({ sulphur });
    }
}
