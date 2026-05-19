import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportStationCopyRq, ITransportStationCopyRs, ITransportStationListDTO } from '@lib/apis';

@Component({
    host: { selector: 'station-copy' },
    templateUrl: './station-copy.component.html',
    styleUrls: ['./station-copy.component.scss'],
    standalone: false
})
export class StationCopyComponent {
    public ngxForm: INgxForm = {
        submit: 'کپی ایستگاه',
        inputs: [
            { type: 'COMMENT', title: 'ایستگاه', value: this.data.station.title },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { station: ITransportStationListDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.station.id;
        const body: ITransportStationCopyRq = {
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<ITransportStationCopyRs>('TransportStationCopy', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
