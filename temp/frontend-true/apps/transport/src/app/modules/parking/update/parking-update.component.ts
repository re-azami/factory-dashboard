import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportParkingDTO, ITransportParkingUpdateRq, ITransportParkingUpdateRs } from '@lib/apis';

import { AppCoordinates } from '../../../app.coordinate';

@Component({
    host: { selector: 'parking-update' },
    templateUrl: './parking-update.component.html',
    styleUrls: ['./parking-update.component.scss'],
    standalone: false
})
export class ParkingUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش پارکینگ',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.parking.title },
            {
                name: 'coordinates',
                type: 'COORDINATES',
                value: { latitude: this.data.parking.latitude, longitude: this.data.parking.longitude },
                center: { latitude: AppCoordinates.MAP.latitude, longitude: AppCoordinates.MAP.longitude },
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { parking: ITransportParkingDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.parking.id;
        const body: ITransportParkingUpdateRq = {
            title: values['title'],
            latitude: values['coordinates'].latitude,
            longitude: values['coordinates'].longitude,
        };
        this.apiService.request<ITransportParkingUpdateRs>('TransportParkingUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
