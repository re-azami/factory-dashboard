import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperDurationPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ITransportParkingDTO,
    ITransportParkingMapRs,
    ITransportParkingVehicleDTO,
    ITransportRouteCalculateRq,
    ITransportRouteCalculateRs,
    ITransportRouteCenterDTO,
    ITransportRouteDTO,
    ITransportRouteLocationDTO,
    ITransportRoutePathDTO,
    ITransportStationCenterDTO,
    ITransportStationDTO,
    ITransportStationLocationDTO,
} from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { TransportVehicleInfo } from '@lib/shared';

import { TransportMapService } from '../../../../providers';
import { AppCoordinates } from '../../../../app.coordinate';

import { IRouteConfig, IRouteVehicle } from '../../route.interface';
import { RouteCreateComponent } from '../../create/route-create.component';

import { RouteMapCreateOptionComponent } from './option/route-map-create-option.component';

@Component({
    host: { selector: 'route-map-create' },
    templateUrl: './route-map-create.component.html',
    styleUrls: ['./route-map-create.component.scss'],
    standalone: false
})
export class RouteMapCreateComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public applicationTitle: string = this.configService.applicationTitle;
    public transportVehicleInfo = TransportVehicleInfo;

    public station: ITransportStationDTO = this.activatedRoute.snapshot.data['station'];
    public centers: ITransportStationCenterDTO[] = this.station.centers;
    public selectedCenter?: { index: number; center: ITransportStationCenterDTO; location?: ITransportStationLocationDTO };

    public map!: Map;
    public loading: boolean = true;
    public parkings: ITransportParkingDTO[] = [];
    public vehicles: IRouteVehicle[] = [];
    public config: IRouteConfig = {
        vehicles: [],
        time: { route: 120, stop: 120, search: 5 },
        search: { type: 'PERCENT', percent: 50, passengers: [] },
        count: { capacity: 0, passenger: 0 },
    };

    public pathIndex: number | null = null;
    public paths: ITransportRoutePathDTO[] = [];
    public pathCount: { center: number; location: number; passenger: number } = { center: 0, location: 0, passenger: 0 };
    public selectedPathCenter?: {
        pathIndex: number;
        path: ITransportRoutePathDTO;
        centerIndex: number;
        center: ITransportRouteCenterDTO;
    };
    public selectedPathParking?: 'PARKING' | 'SITE';

    private clickKey?: EventsKey;
    private durationPipe = new NgxHelperDurationPipe();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly transportMapService: TransportMapService,
    ) {}

    ngOnInit(): void {
        this.map = this.transportMapService.initMap();

        this.apiService.request<ITransportParkingMapRs>('TransportParkingMap', (response) => {
            this.loading = false;
            this.parkings = response;
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

            this.setCentersMap();
        });
    }

    calculate(): void {
        if (this.parkings.length === 0) return;

        this.ngxHelperBottomSheetService.open<IRouteConfig>(
            RouteMapCreateOptionComponent,
            'محاسبه مسیرها',
            { data: { station: this.station, parkings: this.parkings, vehicles: this.vehicles, config: this.config } },
            (response) => {
                this.config = response;
                const body: ITransportRouteCalculateRq = {
                    station: this.station.id,
                    vehicles: this.vehicles
                        .filter((vehicle: IRouteVehicle) => this.config.vehicles.includes(vehicle.id))
                        .map((vehicle: IRouteVehicle) => ({ parking: vehicle.parking.id, vehicle: vehicle.id })),
                    time: this.config.time,
                    search: this.config.search.type,
                    percent: this.config.search.percent,
                    passengers: this.config.search.passengers,
                    destination: {
                        latitude: AppCoordinates.SITE.latitude,
                        longitude: AppCoordinates.SITE.longitude,
                    },
                };
                this.apiService.request<ITransportRouteCalculateRs>('TransportRouteCalculate', { body }, (response) => {
                    this.paths = response;
                    this.pathCount = { center: 0, location: 0, passenger: 0 };
                    this.paths.forEach((path: ITransportRoutePathDTO) => {
                        path.centers.forEach((center: ITransportRouteCenterDTO) => {
                            this.pathCount.center++;
                            center.locations.forEach((location: ITransportRouteLocationDTO) => {
                                this.pathCount.location++;
                                this.pathCount.passenger += location.passengers.length;
                            });
                        });
                    });

                    this.pathIndex = null;
                    this.setPathsMap();
                });
            },
        );
    }

    create(): void {
        if (this.paths.length === 0) return;

        this.ngxHelperBottomSheetService.open<ITransportRouteDTO>(
            RouteCreateComponent,
            'ثبت مسیر',
            {
                data: {
                    station: this.station,
                    paths: this.paths,
                    stop: this.config.time.stop,
                    percent: this.config.search.type === 'PERCENT' ? this.config.search.percent : null,
                },
            },
            (response) => {
                this.router.navigate(['/route', 'map', response.id]);
                this.ngxHelperToastService.success('محاسبه مسیرها با موفقیت ثبت شد.');
            },
        );
    }

    setPathIndex(): void {
        if (this.pathIndex === null || !this.paths[this.pathIndex]) {
            this.pathIndex = null;
            this.setPathsMap();
        } else this.setPathIndexMap();
    }

    selectCenter(index: number): void {
        if (this.pathIndex === null || !this.paths[this.pathIndex]) return;

        const path: ITransportRoutePathDTO = this.paths[this.pathIndex];
        if (!path.centers[index]) return;

        const center: ITransportRouteCenterDTO = path.centers[index];
        this.selectedPathCenter = { pathIndex: this.pathIndex, path, centerIndex: index, center };
        this.selectedPathParking = undefined;

        // VIEW
        this.transportMapService.setView(this.map, center.latitude, center.longitude);
    }

    setParkingParking(): void {
        if (this.pathIndex === null || !this.paths[this.pathIndex]) return;
        const path: ITransportRoutePathDTO = this.paths[this.pathIndex];

        this.selectedPathCenter = undefined;
        this.selectedPathParking = 'PARKING';

        // VIEW
        this.transportMapService.setView(this.map, path.parking.latitude, path.parking.longitude);
    }

    setParkingEsmiran(): void {
        this.selectedPathCenter = undefined;
        this.selectedPathParking = 'SITE';

        // VIEW
        this.transportMapService.setView(this.map, AppCoordinates.SITE.latitude, AppCoordinates.SITE.longitude);
    }

    //#region CLICK
    setCenterClick(): void {
        this.clickKey = this.transportMapService.initClick(
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
    }

    setPathClick(): void {
        this.clickKey = this.transportMapService.initClick(
            this.map,
            () => (this.selectedPathCenter = undefined),
            (latitude: number, longitude: number) => {
                if (this.selectedPathCenter) return;
                this.paths.forEach((path: ITransportRoutePathDTO, pathIndex: number) => {
                    path.centers.forEach((center: ITransportRouteCenterDTO, centerIndex: number) => {
                        if (center.latitude === latitude && center.longitude === longitude)
                            this.selectedPathCenter = { pathIndex, path, centerIndex, center };
                    });
                });
            },
        );
    }
    //#endregion

    //#region MAP
    resetMap(): void {
        this.transportMapService.resetMap(this.map);

        if (this.clickKey) unByKey(this.clickKey);
        this.selectedCenter = undefined;
        this.selectedPathCenter = undefined;
        this.selectedPathParking = undefined;
    }

    setCentersMap(): void {
        this.resetMap();

        // LOCATION
        this.centers.forEach((center: ITransportStationCenterDTO) => {
            center.locations.forEach((location: ITransportStationLocationDTO) =>
                this.transportMapService.setLocationLayer(
                    this.map,
                    location.latitude,
                    location.longitude,
                    location.passengers.length,
                    center.color,
                ),
            );
        });

        // CENTER
        this.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
            this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, center.color);
        });

        // CLICK
        this.setCenterClick();
    }

    setPathsMap(): void {
        this.resetMap();

        // LINE
        this.paths.forEach((path: ITransportRoutePathDTO) => {
            // PARKING
            this.transportMapService.setLineLayer(
                this.map,
                [path.parking.longitude, path.parking.latitude],
                [path.centers[0].longitude, path.centers[0].latitude],
                '',
                path.color,
            );

            // PATH
            path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
                if (index === 0) return;

                const from: Coordinate = [path.centers[index - 1].longitude, path.centers[index - 1].latitude];
                const to: Coordinate = [center.longitude, center.latitude];
                this.transportMapService.setLineLayer(this.map, from, to, '', path.color);
            });

            // DESTINATION
            this.transportMapService.setLineLayer(
                this.map,
                [path.centers[path.centers.length - 1].longitude, path.centers[path.centers.length - 1].latitude],
                [AppCoordinates.SITE.longitude, AppCoordinates.SITE.latitude],
                '',
                path.color,
            );
        });

        // CENTER
        this.paths.forEach((path: ITransportRoutePathDTO) => {
            path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
                this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, center.color);
            });
        });

        // PATH PARKING
        this.paths
            .map((path) => path.parking)
            .filter(
                (parking, index, arr) =>
                    arr.findIndex((p) => p.latitude === parking.latitude && p.longitude === parking.longitude) === index,
            )
            .forEach((parking) => this.transportMapService.setParkingLayer(this.map, parking.latitude, parking.longitude));

        // SITE PARKING
        this.transportMapService.setDestinationLayer(this.map, AppCoordinates.SITE.latitude, AppCoordinates.SITE.longitude);

        // CLICK
        this.setPathClick();
    }

    setPathIndexMap(): void {
        this.resetMap();

        const pathIndex: number = this.pathIndex as number;
        const path: ITransportRoutePathDTO = this.paths[pathIndex];

        // PARKING LINE
        this.transportMapService.setLineLayer(
            this.map,
            [path.parking.longitude, path.parking.latitude],
            [path.centers[0].longitude, path.centers[0].latitude],
            this.durationPipe.transform(path.centers[0].time.center),
            path.color,
        );

        // PATH LINE
        path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
            if (index === 0) return;
            const from: Coordinate = [path.centers[index - 1].longitude, path.centers[index - 1].latitude];
            const to: Coordinate = [center.longitude, center.latitude];
            const text: string =
                this.durationPipe.transform(center.time.center) + '\n' + this.durationPipe.transform(center.time.total);
            this.transportMapService.setLineLayer(this.map, from, to, text, path.color);
        });

        // DESTINATION LINE
        this.transportMapService.setLineLayer(
            this.map,
            [path.centers[path.centers.length - 1].longitude, path.centers[path.centers.length - 1].latitude],
            [AppCoordinates.SITE.longitude, AppCoordinates.SITE.latitude],
            this.durationPipe.transform(path.centers[path.centers.length - 1].time.total - path.time) +
                '\n' +
                this.durationPipe.transform(path.time),
            path.color,
        );

        // CENTER
        path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
            this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, center.color);
        });

        // PATH PARKING
        this.transportMapService.setParkingLayer(this.map, path.parking.latitude, path.parking.longitude);

        // SITE PARKING
        this.transportMapService.setDestinationLayer(this.map, AppCoordinates.SITE.latitude, AppCoordinates.SITE.longitude);

        // CLICK
        this.setPathClick();
    }
    //#endregion
}
