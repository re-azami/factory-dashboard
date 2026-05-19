import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportParkingCreateRq, ITransportParkingCreateRs } from '@lib/apis';

import { AppCoordinates } from '../../../app.coordinate';

@Component({
    host: { selector: 'parking-create' },
    templateUrl: './parking-create.component.html',
    styleUrls: ['./parking-create.component.scss'],
    standalone: false
})
export class ParkingCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت پارکینگ جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            {
                name: 'coordinates',
                type: 'COORDINATES',
                center: { latitude: AppCoordinates.MAP.latitude, longitude: AppCoordinates.MAP.longitude },
            },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ITransportParkingCreateRq = {
            title: values['title'],
            latitude: values['coordinates'].latitude,
            longitude: values['coordinates'].longitude,
        };
        this.apiService.request<ITransportParkingCreateRs>('TransportParkingCreate', { body }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
