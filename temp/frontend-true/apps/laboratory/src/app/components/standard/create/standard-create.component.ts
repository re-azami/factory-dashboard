import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILaboratoryStandardCreateRq, ILaboratoryStandardCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'standard-create' },
    imports: [NgxFormModule],
    templateUrl: './standard-create.component.html',
    styleUrl: './standard-create.component.scss'
})
export class StandardCreateComponent {
    private standard?: number;
    public ngxForm: INgxForm = {
        submit: 'محاسبه استاندارد',
        inputs: [
            [
                { name: 'weight', type: 'NUMBER', title: 'وزن', decimal: 4, autoFocus: true },
                { name: 'volume', type: 'NUMBER', title: 'حجم', decimal: 4 },
            ],
            { type: 'COMMENT', title: 'استاندارد', value: '', english: true, onChange: this.getStandard.bind(this) },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    getStandard(values: INgxFormValues): string | null {
        this.standard = undefined;

        const volume: number = values['volume'];
        const weight: number = values['weight'];
        if (isNaN(volume) || volume <= 0 || isNaN(weight) || weight <= 0) return null;

        this.standard = +((62.22 * weight) / volume).toFixed(3);
        return this.standard.toString();
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.standard) return;

        const body: ILaboratoryStandardCreateRq = {
            weight: values['weight'],
            volume: values['volume'],
            standard: this.standard,
        };
        this.apiService.request<ILaboratoryStandardCreateRs>('LaboratoryStandardCreate', { body }, (response) => {
            this.ngxHelperToastService.success('مقدار استاندارد با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
