import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportRouteCenterDTO,
    ITransportRouteCreateRq,
    ITransportRouteCreateRs,
    ITransportRouteLocationDTO,
    ITransportRoutePassengerDTO,
    ITransportRoutePathDTO,
    ITransportStationDTO,
} from '@lib/apis';

import { AppCoordinates } from '../../../app.coordinate';

@Component({
    host: { selector: 'route-create' },
    templateUrl: './route-create.component.html',
    styleUrls: ['./route-create.component.scss'],
    standalone: false
})
export class RouteCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت مسیر',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            station: ITransportStationDTO;
            paths: ITransportRoutePathDTO[];
            stop: number;
            percent: number | null;
        },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ITransportRouteCreateRq = {
            title: values['title'],
            description: values['description'],
            station: this.data.station.id,
            paths: [],
            centers: [],
            locations: [],
            passengers: [],
            destination: { latitude: AppCoordinates.SITE.latitude, longitude: AppCoordinates.SITE.longitude },
            config: { stop: this.data.stop, percent: this.data.percent },
        };
        this.data.paths.forEach((path: ITransportRoutePathDTO, pathIndex: number) => {
            body.paths.push({
                path: pathIndex + 1,
                color: path.color,
                time: path.time,
                passenger: path.passenger,
                parking: path.parking.id,
                vehicle: path.vehicle.id,
            });
            path.centers.forEach((center: ITransportRouteCenterDTO, centerIndex: number) => {
                body.centers.push({
                    path: pathIndex + 1,
                    center: centerIndex + 1,
                    color: center.color,
                    timeCenter: center.time.center,
                    timeTotal: center.time.total,
                    passengerCenter: center.passenger.center,
                    passengerTotal: center.passenger.total,
                    latitude: center.latitude,
                    longitude: center.longitude,
                });
                center.locations.forEach((location: ITransportRouteLocationDTO) => {
                    body.locations.push({
                        path: pathIndex + 1,
                        center: centerIndex + 1,
                        location: location.id,
                        time: location.time,
                        distance: location.distance,
                    });
                    body.passengers.push(
                        ...location.passengers.map((passenger: ITransportRoutePassengerDTO) => passenger.id),
                    );
                });
            });
        });
        this.apiService.request<ITransportRouteCreateRs>('TransportRouteCreate', { body }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
