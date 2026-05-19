import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ITransportStationCenterDTO, ITransportStationDTO, ITransportStationLocationDTO } from '@lib/apis';

@Component({
    host: { selector: 'station-map-update-move' },
    templateUrl: './station-map-update-move.component.html',
    styleUrls: ['./station-map-update-move.component.scss'],
    standalone: false
})
export class StationMapUpdateMoveComponent {
    public title: string = `ایستگاه ${this.data.index + 1}`;
    public showWarning: boolean = this.data.center.locations.length === 1;
    public ngxForm: INgxForm = {
        submit: 'تغییر ایستگاه',
        inputs: [
            [
                { type: 'COMMENT', title: 'ایستگاه', value: this.title },
                { type: 'COMMENT', title: 'مکان', value: this.data.location.title },
            ],
            {
                name: 'index',
                type: 'SELECT',
                title: 'انتقال به',
                options: [...Array(this.data.station.centers.length).keys()]
                    .filter((i: number) => i !== this.data.index)
                    .map((i: number) => ({ id: i.toString(), title: `ایستگاه ${i + 1}` })),
            },
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
        this.ngxHelperBottomSheetService.close({ index: +values['index'] });
    }
}
