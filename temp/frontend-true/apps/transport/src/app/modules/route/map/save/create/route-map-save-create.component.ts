import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ITransportRouteSaveRq, ITransportRouteSaveRs, ITransportStationDTO } from '@lib/apis';

import { IRouteBoundary, IRouteVehicle } from '../../../route.interface';

@Component({
    host: { selector: 'route-map-save-create' },
    templateUrl: './route-map-save-create.component.html',
    styleUrl: './route-map-save-create.component.scss',
    standalone: false
})
export class RouteMapSaveCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت مسیر',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            {
                inputs: [
                    {
                        name: 'vehicle',
                        type: 'SELECT',
                        title: 'ناوگان',
                        options: this.data.vehicles.map((v) => ({ id: v.id, title: v.title })),
                    },
                    {
                        name: 'stop',
                        type: 'NUMBER',
                        title: 'زمان توقف ایستگاه (ثانیه)',
                        value: 120,
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
                minimum: 20,
                maximum: 85,
                optional: true,
                description: 'در صورتی که مقدار مشخص نشده باشد، تمام مسافرهای موجود در هر ایستگاه محاسبه می‌شود',
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        private readonly router: Router,
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            station: ITransportStationDTO;
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
        const body: ITransportRouteSaveRq = {
            title: values['title'],
            description: values['description'],
            station: this.data.station.id,
            parking: this.data.vehicles.find((v) => v.id === values['vehicle'])!.parking.id,
            vehicle: values['vehicle'],
            origin: { ...this.data.origin, center: this.data.origin.center || null },
            destination: { ...this.data.destination, center: this.data.destination.center || null },
            path: this.data.path,
            config: { stop: values['stop'], percent: values['percent'] },
        };
        this.apiService.request<ITransportRouteSaveRs>('TransportRouteSave', { body }, (response) => {
            this.ngxHelperToastService.success('مسیر با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close();
            this.router.navigate(['/route', 'map', response.id]);
        });
    }
}
