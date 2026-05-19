import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportRouteFinalRq, ITransportRouteFinalRs, ITransportRouteListDTO } from '@lib/apis';

@Component({
    host: { selector: 'route-final' },
    templateUrl: './route-final.component.html',
    styleUrl: './route-final.component.scss',
    standalone: false
})
export class RouteFinalComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت در مسیرهای نهایی',
        inputs: [
            { type: 'COMMENT', title: 'مسیر', value: this.data.route.title },
            {
                name: 'key',
                type: 'SELECT',
                title: 'شناسه مسیر',
                options: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => ({ id: char, title: char })),
                english: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { route: ITransportRouteListDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.route.id;
        const body: ITransportRouteFinalRq = { key: values['key'] };
        this.apiService.request<ITransportRouteFinalRs>('TransportRouteFinal', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
