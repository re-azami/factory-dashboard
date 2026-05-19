import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ITransportStationCenterDTO, ITransportStationDTO } from '@lib/apis';

import { IRouteBoundary } from '../../../route.interface';

@Component({
    host: { selector: 'route-map-save-boundary' },
    templateUrl: './route-map-save-boundary.component.html',
    styleUrl: './route-map-save-boundary.component.scss',
    standalone: false
})
export class RouteMapSaveBoundaryComponent {
    public ngxForm: INgxForm = {
        submit: `انتخاب ایستگاه ${this.data.type === 'ORIGIN' ? 'مبدا' : 'مقصد'}`,
        inputs: [
            {
                name: 'center',
                type: 'SELECT',
                title: 'ایستگاه',
                value: this.data.center?.toString() || undefined,
                options: this.data.station.centers.map((c, index) => ({
                    id: index.toString(),
                    title: `ایستگاه ${index + 1}`,
                })),
            },
            {
                name: 'path',
                type: 'CHECKBOX',
                message: `اضافه کردن ایستگاه به ${this.data.type === 'ORIGIN' ? 'ابتدای' : 'انتهای'} مسیر`,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { type: 'ORIGIN' | 'DESTINATION'; station: ITransportStationDTO; center?: number },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const center: ITransportStationCenterDTO = this.data.station.centers[+values['center']];
        if (!center) return;

        const boundary: IRouteBoundary = {
            center: +values['center'],
            latitude: center.latitude,
            longitude: center.longitude,
        };
        this.ngxHelperBottomSheetService.close({ boundary: boundary, addToPath: values['path'] });
    }
}
