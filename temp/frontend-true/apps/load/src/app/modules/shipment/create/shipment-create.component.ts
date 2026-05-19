import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadShipmentCreateRq, ILoadShipmentCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'shipment-create' },
    templateUrl: './shipment-create.component.html',
    styleUrl: './shipment-create.component.scss',
    standalone: false
})
export class ShipmentCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت محموله جدید',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان', autoFocus: true }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadShipmentCreateRq = {
            title: values['title'],
        };
        this.apiService.request<ILoadShipmentCreateRs>('LoadShipmentCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
