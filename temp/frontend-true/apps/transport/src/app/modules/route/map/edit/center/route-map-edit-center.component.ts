import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ITransportRouteCenterDTO } from '@lib/apis';

@Component({
    host: { selector: 'route-map-edit-center' },
    templateUrl: './route-map-edit-center.component.html',
    styleUrl: './route-map-edit-center.component.scss',
    standalone: false
})
export class RouteMapEditCenterComponent {
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
        private readonly data: { centers: { index: number; center: ITransportRouteCenterDTO }[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.ngxHelperBottomSheetService.close({ index: +values['center'] });
    }
}
