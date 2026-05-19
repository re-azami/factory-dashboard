import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ITransportParkingDTO,
    ITransportStationCenterDTO,
    ITransportStationDTO,
    ITransportStationLocationDTO,
    ITransportStationPassengerDTO,
} from '@lib/apis';
import { TransportPassenger, TransportPassengerInfo, TransportPassengerList } from '@lib/shared';

import { IRouteConfig, IRouteVehicle } from '../../../route.interface';

@Component({
    host: { selector: 'route-map-create-option' },
    templateUrl: './route-map-create-option.component.html',
    styleUrls: ['./route-map-create-option.component.scss'],
    standalone: false
})
export class RouteMapCreateOptionComponent {
    public ngxForm: INgxForm = {
        submit: 'محاسبه مسیرها',
        inputs: [
            {
                name: 'vehicles',
                type: 'MULTI-SELECT',
                title: 'ناوگان',
                options: this.data.vehicles.map((vehicle: IRouteVehicle) => ({ id: vehicle.id, title: vehicle.title })),
                value: this.data.config.vehicles,
                minCount: 1,
                view: 'SELECT',
            },
            [
                {
                    name: 'time-route',
                    type: 'NUMBER',
                    title: 'حداکثر زمان مسیر (دقیقه)',
                    value: this.data.config.time.route,
                    minimum: 60,
                    maximum: 300,
                    text: 'MINUTE',
                },
                {
                    name: 'time-stop',
                    type: 'NUMBER',
                    title: 'زمان توقف ایستگاه (ثانیه)',
                    value: this.data.config.time.stop,
                    minimum: 10,
                    maximum: 600,
                    text: 'SECOND',
                },
                {
                    name: 'time-search',
                    type: 'NUMBER',
                    title: 'زمان جستجو (ثانیه)',
                    value: this.data.config.time.search,
                    minimum: 2,
                    text: 'SECOND',
                },
            ],
            [
                {
                    name: 'search-type',
                    type: 'SELECT',
                    title: 'نوع جستجو',
                    value: this.data.config.search.type || 'PASSENGER',
                    options: [
                        { id: 'PERCENT', title: 'درصد مسافر' },
                        { id: 'PASSENGER', title: 'نوع مسافر' },
                    ],
                },
                {
                    name: 'search-percent',
                    type: 'NUMBER',
                    title: 'درصد',
                    value: this.data.config.search.percent || 50,
                    minimum: 20,
                    maximum: 85,
                    hideOn: (values: INgxFormValues) => values['search-type'] !== 'PERCENT',
                },
                {
                    name: 'search-passengers',
                    type: 'MULTI-SELECT',
                    title: 'نوع مسافر',
                    options: TransportPassengerList.map((passenger: TransportPassenger) => ({
                        id: passenger,
                        title: TransportPassengerInfo[passenger].title,
                    })),
                    value: this.data.config.search.passengers || [],
                    minCount: 1,
                    view: 'SELECT',
                    hideOn: (values: INgxFormValues) => values['search-type'] !== 'PASSENGER',
                },
            ],
        ],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    public capacity: number = 0;
    public passenger: number = 0;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            station: ITransportStationDTO;
            parkings: ITransportParkingDTO[];
            vehicles: IRouteVehicle[];
            config: IRouteConfig;
        },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
    ) {}

    ngxChange(values: INgxFormValues): void {
        const vehicles: string[] = values['vehicles'] || this.data.config.vehicles;
        this.capacity = this.data.vehicles
            .filter((v: IRouteVehicle) => vehicles.includes(v.id))
            .reduce((sum: number, v) => sum + v.capacity, 0);

        const search: 'PERCENT' | 'PASSENGER' = values['search-type'] || this.data.config.search.type || 'PASSENGER';
        const percent: number = values['search-percent'] || this.data.config.search.percent || 50;
        const passengers: TransportPassenger[] = values['search-passengers'] || this.data.config.search.passengers || [];
        switch (search) {
            case 'PERCENT':
                this.passenger = +((this.data.station.count.passenger * percent) / 100).toFixed(2);
                break;
            case 'PASSENGER':
                this.passenger = 0;
                this.data.station.centers.forEach((center: ITransportStationCenterDTO) =>
                    center.locations.forEach((location: ITransportStationLocationDTO) => {
                        this.passenger += location.passengers.filter((passenger: ITransportStationPassengerDTO) =>
                            passengers.includes(passenger.type),
                        ).length;
                    }),
                );
                break;
        }
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.passenger > this.capacity) {
            this.ngxHelperToastService.error('تعداد مسافر بیشتر از ظرفیت ناوگان انتخاب شده است.');
            return;
        }

        const config: IRouteConfig = {
            vehicles: values['vehicles'],
            time: { route: values['time-route'], stop: values['time-stop'], search: values['time-search'] },
            search: {
                type: values['search-type'],
                percent: values['search-percent'],
                passengers: values['search-passengers'],
            },
            count: { capacity: this.capacity, passenger: this.passenger },
        };
        this.ngxHelperBottomSheetService.close(config);
    }
}
