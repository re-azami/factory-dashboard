import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationUpdateRq,
    ITransportLocationUpdateRs,
} from '@lib/apis';

import { AppCoordinates } from '../../../app.coordinate';

@Component({
    host: { selector: 'location-update' },
    templateUrl: './location-update.component.html',
    styleUrls: ['./location-update.component.scss'],
    standalone: false
})
export class LocationUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش مکان',
        inputs: [
            { type: 'COMMENT', title: 'گروه', value: this.data.group.title },
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.location.title },
            {
                name: 'coordinates',
                type: 'COORDINATES',
                value: { latitude: this.data.location.latitude, longitude: this.data.location.longitude },
                center: { latitude: AppCoordinates.MAP.latitude, longitude: AppCoordinates.MAP.longitude },
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { group: ITransportGroupDTO; location: ITransportLocationDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const group: string = this.data.group.id;
        const ID: string = this.data.location.id;
        const body: ITransportLocationUpdateRq = {
            title: values['title'],
            latitude: values['coordinates'].latitude,
            longitude: values['coordinates'].longitude,
        };
        this.apiService.request<ITransportLocationUpdateRs>(
            'TransportLocationUpdate',
            { body, ids: { ID }, params: { group } },
            () => this.ngxHelperBottomSheetService.close(true),
        );
    }
}
