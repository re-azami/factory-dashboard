import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportStationCenterDTO,
    ITransportStationCreateRq,
    ITransportStationCreateRs,
    ITransportStationLocationDTO,
} from '@lib/apis';

@Component({
    host: { selector: 'station-create' },
    templateUrl: './station-create.component.html',
    styleUrls: ['./station-create.component.scss'],
    standalone: false
})
export class StationCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت ایستگاه',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { centers: ITransportStationCenterDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ITransportStationCreateRq = {
            title: values['title'],
            description: values['description'],
            centers: [],
            locations: [],
        };
        this.data.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
            body.centers.push({
                index: index + 1,
                color: center.color,
                latitude: center.latitude,
                longitude: center.longitude,
            });
            center.locations.forEach((location: ITransportStationLocationDTO) =>
                body.locations.push({
                    center: index + 1,
                    location: location.id,
                    time: location.time,
                    distance: location.distance,
                }),
            );
        });
        this.apiService.request<ITransportStationCreateRs>('TransportStationCreate', { body }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
