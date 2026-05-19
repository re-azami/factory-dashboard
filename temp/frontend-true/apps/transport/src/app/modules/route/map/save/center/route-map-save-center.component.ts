import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ITransportStationCenterDTO } from '@lib/apis';

@Component({
    host: { selector: 'route-map-save-center' },
    templateUrl: './route-map-save-center.component.html',
    styleUrl: './route-map-save-center.component.scss',
    standalone: false
})
export class RouteMapSaveCenterComponent {
    public ngxForm: INgxForm = {
        submit: 'اضافه کردن ایستگاه',
        inputs: [
            {
                name: 'center',
                type: 'SELECT',
                title: 'ایستگاه',
                options: this.data.centers.map((c) => ({ id: c.index.toString(), title: `ایستگاه ${c.index + 1}` })),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { centers: { index: number; center: ITransportStationCenterDTO }[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.ngxHelperBottomSheetService.close({ index: +values['center'] });
    }
}
