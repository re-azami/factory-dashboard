import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ITransportStationCenterDTO, ITransportStationDTO, ITransportStationLocationDTO } from '@lib/apis';

@Component({
    host: { selector: 'station-map-update-center' },
    templateUrl: './station-map-update-center.component.html',
    styleUrls: ['./station-map-update-center.component.scss'],
    standalone: false
})
export class StationMapUpdateCenterComponent {
    public ngxForm: INgxForm = {
        submit: 'ایجاد ایستگاه جدید',
        inputs: [
            [
                { type: 'COMMENT', title: 'ایستگاه', value: `ایستگاه ${this.data.index + 1}` },
                { type: 'COMMENT', title: 'مکان', value: this.data.location.title },
            ],
            { name: 'color', type: 'COLOR' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            station: ITransportStationDTO;
            index: number;
            center: ITransportStationCenterDTO;
            location: ITransportStationLocationDTO;
        },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.ngxHelperBottomSheetService.close({ color: values['color'] });
    }
}
