import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportGroupDTO, ITransportLocationCreateRq, ITransportLocationCreateRs } from '@lib/apis';

import { AppCoordinates } from '../../../app.coordinate';

@Component({
    host: { selector: 'location-create' },
    templateUrl: './location-create.component.html',
    styleUrls: ['./location-create.component.scss'],
    standalone: false
})
export class LocationCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت مکان جدید',
        inputs: [
            { type: 'COMMENT', title: 'گروه', value: this.data.group.title },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            {
                name: 'coordinates',
                type: 'COORDINATES',
                center: { latitude: AppCoordinates.MAP.latitude, longitude: AppCoordinates.MAP.longitude },
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { group: ITransportGroupDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const group: string = this.data.group.id;
        const body: ITransportLocationCreateRq = {
            title: values['title'],
            latitude: values['coordinates'].latitude,
            longitude: values['coordinates'].longitude,
        };
        this.apiService.request<ITransportLocationCreateRs>(
            'TransportLocationCreate',
            { body, params: { group } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
