import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportStationListDTO, ITransportStationUpdateRq, ITransportStationUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'station-update' },
    templateUrl: './station-update.component.html',
    styleUrls: ['./station-update.component.scss'],
    standalone: false
})
export class StationUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش ایستگاه',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.station.title },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.station.description,
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { station: ITransportStationListDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.station.id;
        const body: ITransportStationUpdateRq = {
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<ITransportStationUpdateRs>('TransportStationUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
