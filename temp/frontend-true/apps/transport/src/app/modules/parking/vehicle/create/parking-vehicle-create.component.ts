import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormInputs } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportParkingDTO,
    ITransportParkingVehicleCreateRq,
    ITransportParkingVehicleCreateRs,
} from '@lib/apis';
import { TransportVehicle, TransportVehicleInfo, TransportVehicleList } from '@lib/shared';

@Component({
    host: { selector: 'parking-vehicle-create' },
    templateUrl: './parking-vehicle-create.component.html',
    styleUrls: ['./parking-vehicle-create.component.scss'],
    standalone: false
})
export class ParkingVehicleCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت ناوگان جدید',
        inputs: [
            { type: 'COMMENT', title: 'پارکینگ', value: this.data.parking.title },
            [
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع ناوگان',
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
                            value: TransportVehicleInfo[vehicle].capacity,
                            minimum: 1,
                            suffix: 'نفر',
                            hideOn: (values: INgxFormValues) => values['type'] !== vehicle,
                        } as NgxFormInputs),
                ),
            ],
            { name: 'title', type: 'TEXT', title: 'عنوان' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { parking: ITransportParkingDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const PARKINGID: string = this.data.parking.id;
        const body: ITransportParkingVehicleCreateRq = {
            type: values['type'],
            title: values['title'],
            capacity: values[`capacity-${values['type']}`],
        };
        this.apiService.request<ITransportParkingVehicleCreateRs>(
            'TransportParkingVehicleCreate',
            { body, ids: { PARKINGID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
