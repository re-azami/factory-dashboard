import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDTO, ILoadCargoTruckCreateRq, ILoadCargoTruckCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'cargo-truck-create' },
    templateUrl: './cargo-truck-create.component.html',
    styleUrl: './cargo-truck-create.component.scss',
    standalone: false
})
export class CargoTruckCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت ناوگان اختصاصی',
        inputs: [
            { type: 'COMMENT', title: 'یار', value: this.data.cargo.title },
            { name: 'plate', type: 'PLATE', letter: 'ع', autoFocus: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargo: ILoadCargoDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.cargo.id;
        const body: ILoadCargoTruckCreateRq = { plate: values['plate'].join('-') };
        this.apiService.request<ILoadCargoTruckCreateRs>('LoadCargoTruckCreate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
