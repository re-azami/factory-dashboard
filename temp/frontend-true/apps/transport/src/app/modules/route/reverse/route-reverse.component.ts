import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ITransportRouteDTO, ITransportRouteReverseRq, ITransportRouteReverseRs } from '@lib/apis';

@Component({
    host: { selector: 'route-reverse' },
    templateUrl: './route-reverse.component.html',
    styleUrl: './route-reverse.component.scss',
    standalone: false
})
export class RouteReverseComponent {
    public ngxForm: INgxForm = {
        submit: 'معکوس کردن مسیر',
        inputs: [
            { type: 'COMMENT', title: 'مسیر', value: this.data.route.title },
            {
                inputs: [
                    { type: 'COMMENT', title: 'شماره مسیر', value: (this.data.pathIndex + 1).toString() },
                    {
                        name: 'stop',
                        type: 'NUMBER',
                        title: 'زمان توقف ایستگاه (ثانیه)',
                        value: this.data.route.paths[this.data.pathIndex].config.stop,
                        minimum: 10,
                        maximum: 600,
                        text: 'SECOND',
                    },
                ],
                flex: [2, 1],
            },
            {
                name: 'percent',
                type: 'NUMBER',
                title: 'درصد مسافر',
                value: this.data.route.paths[this.data.pathIndex].config.percent,
                minimum: 20,
                maximum: 85,
                optional: true,
                description: 'در صورتی که مقدار مشخص نشده باشد، تمام مسافرهای موجود در هر ایستگاه محاسبه می‌شود',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { route: ITransportRouteDTO; pathIndex: number },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.route.id;
        const body: ITransportRouteReverseRq = {
            pathIndex: this.data.pathIndex,
            config: { stop: values['stop'], percent: values['percent'] },
        };
        this.apiService.request<ITransportRouteReverseRs>('TransportRouteReverse', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('مسیر با موفقیت معکوس شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
