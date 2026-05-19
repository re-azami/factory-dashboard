import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    IOptionDTO,
    ITransportParkingDTO,
    ITransportParkingVehicleDTO,
    ITransportParkingVehicleTransferRq,
    ITransportParkingVehicleTransferRs,
} from '@lib/apis';

@Component({
    host: { selector: 'parking-vehicle-transfer' },
    templateUrl: './parking-vehicle-transfer.component.html',
    styleUrls: ['./parking-vehicle-transfer.component.scss'],
    standalone: false
})
export class ParkingVehicleTransferComponent {
    public ngxForm: INgxForm = {
        submit: 'انتقال ناوگان',
        inputs: [
            [
                { type: 'COMMENT', title: 'پارکینگ', value: this.data.parking.title },
                { type: 'COMMENT', title: 'ناوگان', value: this.data.vehicle.title },
            ],
            {
                name: 'parking',
                type: 'SELECT',
                title: 'انتقال به',
                options: this.data.parkings.filter((p) => p.id !== this.data.parking.id),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            parkings: IOptionDTO[];
            parking: ITransportParkingDTO;
            vehicle: ITransportParkingVehicleDTO;
        },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const PARKINGID: string = this.data.parking.id;
        const ID: string = this.data.vehicle.id;
        const body: ITransportParkingVehicleTransferRq = { parking: values['parking'] };
        this.apiService.request<ITransportParkingVehicleTransferRs>(
            'TransportParkingVehicleTransfer',
            { body, ids: { PARKINGID, ID } },
            (response) => this.ngxHelperBottomSheetService.close(response.from),
        );
    }
}
