import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ITransportRouteDTO, ITransportRouteEditRq, ITransportRouteEditRs } from '@lib/apis';

import { IRouteBoundary, IRouteVehicle } from '../../../route.interface';

@Component({
    host: { selector: 'route-map-edit-create' },
    templateUrl: './route-map-edit-create.component.html',
    styleUrl: './route-map-edit-create.component.scss',
    standalone: false
})
export class RouteMapEditCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت مسیر',
        inputs: [
            { type: 'COMMENT', title: 'مسیر', value: this.data.route.title },
            {
                inputs: [
                    {
                        name: 'vehicle',
                        type: 'SELECT',
                        title: 'ناوگان',
                        value: this.data.route.paths[this.data.pathIndex].vehicle.id,
                        options: this.data.vehicles.map((v) => ({ id: v.id, title: v.title })),
                    },
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
        private readonly router: Router,
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            route: ITransportRouteDTO;
            pathIndex: number;
            vehicles: IRouteVehicle[];
            origin: IRouteBoundary;
            destination: IRouteBoundary;
            path: number[];
        },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.route.id;
        const body: ITransportRouteEditRq = {
            pathIndex: this.data.pathIndex,
            parking: this.data.vehicles.find((v) => v.id === values['vehicle'])!.parking.id,
            vehicle: values['vehicle'],
            origin: { ...this.data.origin, center: this.data.origin.center || null },
            destination: { ...this.data.destination, center: this.data.destination.center || null },
            path: this.data.path,
            config: { stop: values['stop'], percent: values['percent'] },
        };
        this.apiService.request<ITransportRouteEditRs>('TransportRouteEdit', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('مسیر با موفقیت ویرایش شد.');
            this.ngxHelperBottomSheetService.close();
            this.router.navigate(['/route', 'map', response.id]);
        });
    }
}
