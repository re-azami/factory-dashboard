import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILaboratoryCargoDTO, ILaboratoryCargoUpdateRq, ILaboratoryCargoUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'cargo-update' },
    templateUrl: './cargo-update.component.html',
    styleUrl: './cargo-update.component.scss',
    standalone: false
})
export class CargoUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش بار',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.cargo.title, autoFocus: true }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargo: ILaboratoryCargoDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.cargo.id;
        const body: ILaboratoryCargoUpdateRq = {
            title: values['title'],
        };
        this.apiService.request<ILaboratoryCargoUpdateRs>('LaboratoryCargoUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
