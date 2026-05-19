import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
    ITransportRouteCenterDTO,
    ITransportRouteDTO,
    ITransportRouteLocationDTO,
    ITransportRoutePathDTO,
} from '@lib/apis';

import { AppCoordinates } from '../../../../app.coordinate';
import { TransportMapService } from '../../../../providers';

import { IRouteBoundary, IRouteVehicle } from '../../route.interface';

import { RouteMapEditBoundaryComponent } from './boundary/route-map-edit-boundary.component';
import { RouteMapEditCenterComponent } from './center/route-map-edit-center.component';
import { RouteMapEditCreateComponent } from './create/route-map-edit-create.component';

@Component({
    host: { selector: 'route-map-edit' },
    templateUrl: './route-map-edit.component.html',
    styleUrl: './route-map-edit.component.scss',
    standalone: false
})
export class RouteMapEditComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public route: ITransportRouteDTO = this.activatedRoute.snapshot.data['route'];
    public pathIndex: number = +this.activatedRoute.snapshot.params['pathIndex'];
    public centers: ITransportRouteCenterDTO[] = [...this.route.centers, ...this.route.paths.map((p) => p.centers).flat()];
    public count: { center: number; location: number; passenger: number } = {
        center: this.centers.length,
        location: this.centers.reduce((sum: number, c) => sum + c.locations.length, 0),
        passenger: this.centers.reduce(
            (sum: number, c) => sum + c.locations.reduce((sum: number, l) => sum + l.passengers.length, 0),
            0,
        ),
    };

    public origin?: IRouteBoundary;
    public destination?: IRouteBoundary;
    public path: { index: number; center: ITransportRouteCenterDTO; location: number; passenger: number }[] = [];

    public loading: boolean = true;
    public vehicles: IRouteVehicle[] = [];

    public map!: Map;
    public selectedCenter?: { index: number; center: ITransportRouteCenterDTO; location?: ITransportRouteLocationDTO };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperCoordinatesService: NgxHelperCoordinatesService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly transportMapService: TransportMapService,
    ) {}

    ngOnInit(): void {
        if (isNaN(this.pathIndex) || this.pathIndex < 0 || !this.route.paths[this.pathIndex]) {
            this.router.navigate(['/route', 'map', this.route.id]);
            return;
        }

        const findCenter = (latitude: number, longitude: number): number =>
            this.centers.findIndex((c) => c.latitude === latitude && c.longitude === longitude);

        const path: ITransportRoutePathDTO = this.route.paths[this.pathIndex];
        // ORIGIN
        const originLatitude: number = path.parking.latitude;
        const originLongitude: number = path.parking.longitude;
        const originCenter = findCenter(originLatitude, originLongitude);
        this.origin = {
            center: originCenter === -1 ? undefined : originCenter,
            esmiran:
                originCenter === -1 &&
                originLatitude === AppCoordinates.SITE.latitude &&
                originLongitude === AppCoordinates.SITE.longitude,
            latitude: originLatitude,
            longitude: originLongitude,
        };
        // DESTINATION
        const destinationLatitude: number = path.destination ? path.destination.latitude : this.route.destination.latitude;
        const destinationLongitude: number = path.destination
            ? path.destination.longitude
            : this.route.destination.longitude;
        const destinationCenter = findCenter(destinationLatitude, destinationLongitude);
        this.destination = {
            center: destinationCenter === -1 ? undefined : destinationCenter,
            esmiran:
                destinationCenter === -1 &&
                destinationLatitude === AppCoordinates.SITE.latitude &&
                destinationLongitude === AppCoordinates.SITE.longitude,
            latitude: destinationLatitude,
            longitude: destinationLongitude,
        };
        // PATH
        this.path = path.centers.map((c) => ({
            index: findCenter(c.latitude, c.longitude),
            center: c,
            location: c.locations.length,
            passenger: c.locations.reduce((sum: number, l) => sum + l.passengers.length, 0),
        }));

        this.map = this.transportMapService.initMap();

        this.transportMapService.initClick(
            this.map,
            () => (this.selectedCenter = undefined),
            (latitude: number, longitude: number) => {
                if (this.selectedCenter) return;
                this.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
                    if (center.latitude === latitude && center.longitude === longitude)
                        this.selectedCenter = { index, center };
                    else
                        center.locations.forEach((location: ITransportRouteLocationDTO) => {
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
            RouteMapEditBoundaryComponent,
            `انتخاب ایستگاه مبدا`,
            { data: { type: 'ORIGIN', centers: this.centers, center: this.origin?.center } },
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
            RouteMapEditBoundaryComponent,
            `انتخاب ایستگاه مقصد`,
            { data: { type: 'DESTINATION', centers: this.centers, center: this.destination?.center } },
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
        const centers: { index: number; center: ITransportRouteCenterDTO }[] = [];
        this.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
            if (!indexes.includes(index)) centers.push({ index, center });
        });

        if (centers.length === 0) {
            this.ngxHelperToastService.error('تمام ایستگاه‌ها در مسیر ثبت شده‌اند.');
            return;
        }

        this.ngxHelperBottomSheetService.open<{ index: number }>(
            RouteMapEditCenterComponent,
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

    editRoute(): void {
        if (!this.origin || !this.destination || this.path.length === 0) return;

        this.ngxHelperBottomSheetService.open(RouteMapEditCreateComponent, 'ثبت مسیر', {
            data: {
                route: this.route,
                pathIndex: this.pathIndex,
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
        this.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
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
