import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ILaboratoryTestDavisRecoveryDTO } from '@lib/apis';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'test-davis-recovery' },
    imports: [NgxFormModule],
    templateUrl: './test-davis-recovery.component.html',
    styleUrl: './test-davis-recovery.component.scss'
})
export class TestDavisRecoveryComponent {
    public result?: number = this.data.recovery?.result;
    public ngxForm: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs: [
            [
                {
                    name: 'empty',
                    type: 'NUMBER',
                    title: 'وزن ظرف خالی',
                    value: this.data.recovery?.empty || undefined,
                    decimal: 4,
                    autoFocus: true,
                    id: 'ID-input-0',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(0, event),
                    },
                },
                {
                    name: 'dry',
                    type: 'NUMBER',
                    title: 'وزن ظرف خشک',
                    value: this.data.recovery?.dry || undefined,
                    decimal: 4,
                    id: 'ID-input-1',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(1, event),
                    },
                },
                {
                    name: 'count',
                    type: 'NUMBER',
                    title: 'تعداد توزین',
                    value: this.data.recovery?.count || 10,
                    id: 'ID-input-2',
                    keyboard: {
                        up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(2, event),
                    },
                },
            ],
            {
                type: 'COMMENT',
                title: 'ریکاوری',
                value: this.data.recovery?.result.toString() || '',
                english: true,
                onChange: this.setResult.bind(this),
            },
        ],
        buttons: [
            {
                title: this.data.recovery ? 'حذف مقدار' : 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: { recovery?: ILaboratoryTestDavisRecoveryDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    setResult(values: INgxFormValues): string | null {
        this.result = undefined;

        const empty: number = values['empty'];
        const dry: number = values['dry'];
        const count: number = values['count'];
        if (isNaN(empty) || empty <= 0 || isNaN(dry) || dry <= 0 || isNaN(count) || count <= 0 || empty >= dry) return null;

        this.result = +(((dry - empty) / count) * 100).toFixed(2);
        return this.result.toString();
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.result) return;

        const recovery: ILaboratoryTestDavisRecoveryDTO = {
            empty: values['empty'],
            dry: values['dry'],
            count: values['count'],
            result: this.result,
        };
        this.ngxHelperBottomSheetService.close({ recovery });
    }
}
