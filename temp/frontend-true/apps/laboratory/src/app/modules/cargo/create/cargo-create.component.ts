import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILaboratoryCargoCreateRq, ILaboratoryCargoCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'cargo-create' },
    templateUrl: './cargo-create.component.html',
    styleUrl: './cargo-create.component.scss',
    standalone: false
})
export class CargoCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت بار جدید',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان' }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILaboratoryCargoCreateRq = {
            title: values['title'],
        };
        this.apiService.request<ILaboratoryCargoCreateRs>('LaboratoryCargoCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
