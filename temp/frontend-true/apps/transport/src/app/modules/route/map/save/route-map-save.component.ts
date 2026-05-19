import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Map } from 'ol';

import { Helper } from '@webilix/helper-library';
import {
    INgxHelperCoordinates,
    NgxHelperBottomSheetService,
    NgxHelperCoordinatesService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportParkingDTO,
    ITransportParkingMapRs,
    ITransportParkingVehicleDTO,
    ITransportStationCenterDTO,
    ITransportStationDTO,
    ITransportStationLocationDTO,
} from '@lib/apis';

import { TransportMapService } from '../../../../providers';
import { AppCoordinates } from '../../../../app.coordinate';

import { IRouteBoundary, IRouteVehicle } from '../../route.interface';

import { RouteMapSaveCenterComponent } from './center/route-map-save-center.component';
import { RouteMapSaveCreateComponent } from './create/route-map-save-create.component';
import { RouteMapSaveBoundaryComponent } from './boundary/route-map-save-boundary.component';

@Component({
    host: { selector: 'route-map-save' },
    templateUrl: './route-map-save.component.html',
    styleUrl: './route-map-save.component.scss',
    standalone: false
})
export class RouteMapSaveComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public station: ITransportStationDTO = this.activatedRoute.snapshot.data['station'];
    public centers: ITransportStationCenterDTO[] = this.station.centers;

    public origin?: IRouteBoundary;
    public destination?: IRouteBoundary;
    public path: { index: number; center: ITransportStationCenterDTO; location: number; passenger: number }[] = [];

    public loading: boolean = true;
    public vehicles: IRouteVehicle[] = [];

    public map!: Map;
    public selectedCenter?: { index: number; center: ITransportStationCenterDTO; location?: ITransportStationLocationDTO };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperCoordinatesService: NgxHelperCoordinatesService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly transportMapService: TransportMapService,
    ) {}

    ngOnInit(): void {
        this.map = this.transportMapService.initMap();

        this.transportMapService.initClick(
            this.map,
            () => (this.selectedCenter = undefined),
            (latitude: number, longitude: number) => {
                if (this.selectedCenter) return;
                this.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
                    if (center.latitude === latitude && center.longitude === longitude)
                        this.selectedCenter = { index, center };
                    else
                        center.locations.forEach((location: ITransportStationLocationDTO) => {
                            if (location.latitude === latitude && location.longitude === longitude)
                                this.selectedCenter = { index, center, location };
                        });
                });
            },
        );

        this.apiService.request<ITransportParkingMapRs>('TransportParkingMap', (response) => {
            this.loading = false;
            this.vehicles = response
                .map((parking: ITransportParkingDTO) =>
                    parking.vehicles.map(
                        (vehicle: ITransportParkingVehicleDTO) =>
                            ({
                                ...vehicle,
                                title: `${parking.title} :: ${vehicle.title}`,
                                parking: {
                                    id: parking.id,
                                    title: parking.title,
                                    latitude: parking.latitude,
                                    longitude: parking.longitude,
                                },
                            } as IRouteVehicle),
                    ),
                )
                .flat()
                .sort((v1, v2) => v1.title.localeCompare(v2.title));

            this.setMap();
        });
    }

    drop(event: CdkDragDrop<any>): void {
        if (event.previousIndex === event.currentIndex) return;
        moveItemInArray(this.path, event.previousIndex, event.currentIndex);
        this.setMap();
    }

    setOriginEsmiran(): void {
        this.origin = { esmiran: true, latitude: AppCoordinates.SITE.latitude, longitude: AppCoordinates.SITE.longitude };
        this.setMap();
    }

    setOriginStation(): void {
        this.ngxHelperBottomSheetService.open<{ boundary: IRouteBoundary; addToPath: boolean }>(
            RouteMapSaveBoundaryComponent,
            `انتخاب ایستگاه مبدا`,
            { data: { type: 'ORIGIN', station: this.station, center: this.origin?.center } },
            (response) => {
                this.origin = response.boundary;
                if (response.addToPath && response.boundary.center !== undefined) {
                    const center = this.centers[response.boundary.center];
                    this.path.unshift({
                        index: response.boundary.center,
                        center,
                        location: center.locations.length,
                        passenger: center.locations.reduce((sum: number, l) => sum + l.passengers.length, 0),
                    });
                }

                this.setMap();
            },
        );
    }

    setOriginCoordinates(): void {
        const action: Promise<INgxHelperCoordinates> = this.origin
            ? this.ngxHelperCoordinatesService.get(this.origin, { view: AppCoordinates.MAP })
            : this.ngxHelperCoordinatesService.get({ view: AppCoordinates.MAP });

        action.then((coordinates: INgxHelperCoordinates) => {
            this.origin = coordinates;
            this.setMap();
        });
    }

    setDestinationEsmiran() {
        this.destination = {
            esmiran: true,
            latitude: AppCoordinates.SITE.latitude,
            longitude: AppCoordinates.SITE.longitude,
        };
        this.setMap();
    }

    setDestinationStation(): void {
        this.ngxHelperBottomSheetService.open<{ boundary: IRouteBoundary; addToPath: boolean }>(
            RouteMapSaveBoundaryComponent,
            `انتخاب ایستگاه مقصد`,
            { data: { type: 'DESTINATION', station: this.station, center: this.destination?.center } },
            (response) => {
                this.destination = response.boundary;
                if (response.addToPath && response.boundary.center !== undefined) {
                    const center = this.centers[response.boundary.center];
                    this.path.push({
                        index: response.boundary.center,
                        center,
                        location: center.locations.length,
                        passenger: center.locations.reduce((sum: number, l) => sum + l.passengers.length, 0),
                    });
                }

                this.setMap();
            },
        );
    }

    setDestinationCoordinates(): void {
        const action: Promise<INgxHelperCoordinates> = this.destination
            ? this.ngxHelperCoordinatesService.get(this.destination, { view: AppCoordinates.MAP })
            : this.ngxHelperCoordinatesService.get({ view: AppCoordinates.MAP });

        action.then((coordinates: INgxHelperCoordinates) => {
            this.destination = coordinates;
            this.setMap();
        });
    }

    addCenter(): void {
        const indexes: number[] = this.path.map((p) => p.index);
        const centers: { index: number; center: ITransportStationCenterDTO }[] = [];
        this.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
            if (!indexes.includes(index)) centers.push({ index, center });
        });

        if (centers.length === 0) {
            this.ngxHelperToastService.error('تمام ایستگاه‌ها در مسیر ثبت شده‌اند.');
            return;
        }

        this.ngxHelperBottomSheetService.open<{ index: number }>(
            RouteMapSaveCenterComponent,
            'اضافه کردن ایستگاه',
            { data: { centers } },
            (response) => {
                this.path.push({
                    index: response.index,
                    center: this.centers[response.index],
                    location: this.centers[response.index].locations.length,
                    passenger: this.centers[response.index].locations.reduce(
                        (sum: number, l) => sum + l.passengers.length,
                        0,
                    ),
                });
                this.setMap();
            },
        );
    }

    deleteCenter(index: number) {
        if (!this.path[index]) return;

        this.path.splice(index, 1);
        this.setMap();
    }

    createRoute(): void {
        if (!this.origin || !this.destination || this.path.length === 0) return;

        this.ngxHelperBottomSheetService.open(RouteMapSaveCreateComponent, 'ثبت مسیر', {
            data: {
                station: this.station,
                vehicles: this.vehicles,
                origin: this.origin,
                destination: this.destination,
                path: this.path.map((p) => p.index),
            },
        });
    }

    //#region MAP
    resetMap(): void {
        this.transportMapService.resetMap(this.map);

        this.selectedCenter = undefined;
    }

    setMap(): void {
        this.resetMap();

        // LINE
        if (this.origin && this.destination && this.path.length !== 0) {
            this.transportMapService.setLineLayer(
                this.map,
                [this.origin.longitude, this.origin.latitude],
                [this.path[0].center.longitude, this.path[0].center.latitude],
                '',
                'rgb(29, 91, 116)',
            );
            for (let index = 0; index < this.path.length - 1; index++)
                this.transportMapService.setLineLayer(
                    this.map,
                    [this.path[index].center.longitude, this.path[index].center.latitude],
                    [this.path[index + 1].center.longitude, this.path[index + 1].center.latitude],
                    '',
                    'rgb(29, 91, 116)',
                );
            this.transportMapService.setLineLayer(
                this.map,
                [this.path[this.path.length - 1].center.longitude, this.path[this.path.length - 1].center.latitude],
                [this.destination.longitude, this.destination.latitude],
                '',
                'rgb(29, 91, 116)',
            );
        }

        // CENTER
        const indexes: number[] = this.path.map((p) => p.index);
        this.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
            this.transportMapService.setCenterLayer(
                this.map,
                index,
                center.latitude,
                center.longitude,
                this.origin && this.destination && this.path.length !== 0
                    ? indexes.includes(index)
                        ? center.color
                        : Helper.COLOR.getShade(center.color, 10)[6]
                    : center.color,
            );
        });

        // ORIGIN
        if (this.origin) this.transportMapService.setParkingLayer(this.map, this.origin.latitude, this.origin.longitude);

        // DESTINATION
        if (this.destination)
            this.transportMapService.setDestinationLayer(this.map, this.destination.latitude, this.destination.longitude);
    }
    //#endregion
}
