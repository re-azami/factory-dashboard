import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormInputs } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportParkingDTO,
    ITransportParkingVehicleDTO,
    ITransportParkingVehicleUpdateRq,
    ITransportParkingVehicleUpdateRs,
} from '@lib/apis';
import { TransportVehicle, TransportVehicleInfo, TransportVehicleList } from '@lib/shared';

@Component({
    host: { selector: 'parking-vehicle-update' },
    templateUrl: './parking-vehicle-update.component.html',
    styleUrls: ['./parking-vehicle-update.component.scss'],
    standalone: false
})
export class ParkingVehicleUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش ناوگان',
        inputs: [
            { type: 'COMMENT', title: 'پارکینگ', value: this.data.parking.title },
            [
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع ناوگان',
                    value: this.data.vehicle.type,
                    options: TransportVehicleList.map((vehicle: TransportVehicle) => ({
                        id: vehicle,
                        title: TransportVehicleInfo[vehicle].title,
                    })),
                },
                ...TransportVehicleList.map(
                    (vehicle: TransportVehicle) =>
                        ({
                            name: `capacity-${vehicle}`,
                            type: 'NUMBER',
                            title: 'ظرفیت',
                            value:
                                this.data.vehicle.type === vehicle
                                    ? this.data.vehicle.capacity
                                    : TransportVehicleInfo[vehicle].capacity,
                            minimum: 1,
                            suffix: 'نفر',
                            hideOn: (values: INgxFormValues) => values['type'] !== vehicle,
                        } as NgxFormInputs),
                ),
            ],
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.vehicle.title },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { parking: ITransportParkingDTO; vehicle: ITransportParkingVehicleDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const PARKINGID: string = this.data.parking.id;
        const ID: string = this.data.vehicle.id;
        const body: ITransportParkingVehicleUpdateRq = {
            type: values['type'],
            title: values['title'],
            capacity: values[`capacity-${values['type']}`],
        };
        this.apiService.request<ITransportParkingVehicleUpdateRs>(
            'TransportParkingVehicleUpdate',
            { body, ids: { PARKINGID, ID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
