import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadTruckCreateRq, ILoadTruckCreateRs, IOptionDTO } from '@lib/apis';

@Component({
    host: { selector: 'truck-create' },
    templateUrl: './truck-create.component.html',
    styleUrl: './truck-create.component.scss',
    standalone: false
})
export class TruckCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت ناوگان جدید',
        inputs: [
            { name: 'owner', type: 'SELECT', title: 'مالک', options: this.data.owners },
            { name: 'plate', type: 'PLATE', letter: 'ع' },
            [
                { name: 'type', type: 'TEXT', title: 'مدل' },
                { name: 'vin', type: 'TEXT', title: 'شماره شاسی', optional: true, english: true },
            ],
            'مشخصات راننده',
            { name: 'driverName', type: 'NAME' },
            [
                { name: 'driverMobile', type: 'MOBILE', title: 'موبایل' },
                { name: 'driverNationalCode', type: 'NATIONAL-CODE', title: 'کدملی', optional: true },
            ],
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { owners: IOptionDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadTruckCreateRq = {
            owner: values['owner'],
            plate: values['plate'].join('-'),
            type: values['type'],
            vin: values['vin'],
            driverName: values['driverName'],
            driverMobile: values['driverMobile'],
            driverNationalCode: values['driverNationalCode'],
        };
        this.apiService.request<ILoadTruckCreateRs>('LoadTruckCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
