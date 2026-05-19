import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadShipmentDTO, ILoadShipmentUpdateRq, ILoadShipmentUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'shipment-update' },
    templateUrl: './shipment-update.component.html',
    styleUrl: './shipment-update.component.scss',
    standalone: false
})
export class ShipmentUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش محموله',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.shipment.title, autoFocus: true }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { shipment: ILoadShipmentDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.shipment.id;
        const body: ILoadShipmentUpdateRq = {
            title: values['title'],
        };
        this.apiService.request<ILoadShipmentUpdateRs>('LoadShipmentUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
