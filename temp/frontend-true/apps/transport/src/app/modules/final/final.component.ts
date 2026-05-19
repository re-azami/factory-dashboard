import { Component, HostBinding, OnInit } from '@angular/core';

import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';

import { NgxHelperMenu } from '@webilix/ngx-helper/menu';
import { NgxHelperDurationPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ITransportFinalRs,
    ITransportRouteCenterDTO,
    ITransportRouteDTO,
    ITransportRouteLocationDTO,
    ITransportRoutePassengerDTO,
    ITransportRoutePathDTO,
} from '@lib/apis';
import { DownloadService } from '@lib/providers';
import { TransportVehicleInfo } from '@lib/shared';

import { TransportMapService } from '../../providers';

@Component({
    host: { selector: 'final' },
    templateUrl: './final.component.html',
    styleUrl: './final.component.scss',
    standalone: false
})
export class FinalComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public transportVehicleInfo = TransportVehicleInfo;

    public loading: boolean = true;
    public routes: ITransportRouteDTO[] = [];
    public routeIndex: number = 0;
    public route!: ITransportRouteDTO;
    public pathIndex: number | null = null;

    public map!: Map;
    public selectedPathParking?: 'ORIGIN' | 'DESTINATION';
    public selectedPathCenter?: {
        pathIndex: number;
        path: ITransportRoutePathDTO;
        centerIndex: number;
        center: ITransportRouteCenterDTO;
    };

    public showLines: boolean = true;
    public showBoundaries: boolean = true;
    public linesMenu: NgxHelperMenu[] = [
        {
            title: 'نمایش خطوط مسیر',
            click: () => {
                this.showLines = true;
                this.setMap();
            },
            disableOn: () => this.showLines,
        },
        {
            title: 'عدم نمایش خطوط مسیر',
            click: () => {
                this.showLines = false;
                this.setMap();
            },
            disableOn: () => !this.showLines,
        },
        'DIVIDER',
        {
            title: 'نمایش مبدا / مقصد',
            click: () => {
                this.showBoundaries = true;
                this.setMap();
            },
            disableOn: () => this.showBoundaries,
        },
        {
            title: 'عدم نمایش مبدا / مقصد',
            click: () => {
                this.showBoundaries = false;
                this.setMap();
            },
            disableOn: () => !this.showBoundaries,
        },
    ];

    public exportMenu: NgxHelperMenu[] = [
        { title: 'لیست ایستگاه‌ها', click: () => this.export('STATION') },
        { title: 'لیست مسافرها', click: () => this.export('PERSONNEL') },
    ];

    constructor(
        private readonly apiService: ApiService,
        private readonly downloadService: DownloadService,
        private readonly transportMapService: TransportMapService,
    ) {}

    ngOnInit(): void {
        this.map = this.transportMapService.initMap();

        this.transportMapService.initClick(
            this.map,
            () => (this.selectedPathCenter = undefined),
            (latitude: number, longitude: number) => {
                if (this.selectedPathCenter) return;
                this.route.paths.forEach((path: ITransportRoutePathDTO, pathIndex: number) => {
                    path.centers.forEach((center: ITransportRouteCenterDTO, centerIndex: number) => {
                        if (center.latitude === latitude && center.longitude === longitude)
                            this.selectedPathCenter = { pathIndex, path, centerIndex, center };
                    });
                });
            },
        );

        this.apiService.request<ITransportFinalRs>('TransportFinal', (response) => {
            this.loading = false;
            this.routes = response;

            this.setRouteIndex();
        });
    }

    setRouteIndex(): void {
        if (this.routes.length === 0) return;

        this.selectedPathCenter = undefined;
        this.route = this.routes[this.routeIndex];
        this.pathIndex = this.route.paths.length === 1 ? 0 : null;
        this.setMap();
    }

    setPathIndex(): void {
        if (!this.route) return;

        this.selectedPathCenter = undefined;
        this.setMap();
    }

    selectCenter(index: number): void {
        if (this.pathIndex === null || !this.route.paths[this.pathIndex]) return;

        const path: ITransportRoutePathDTO = this.route.paths[this.pathIndex];
        if (!path.centers[index]) return;

        const center: ITransportRouteCenterDTO = path.centers[index];
        this.selectedPathCenter = { pathIndex: this.pathIndex, path, centerIndex: index, center };
        this.selectedPathParking = undefined;

        // VIEW
        this.transportMapService.setView(this.map, center.latitude, center.longitude);
    }

    setParkingOrigin(): void {
        if (this.pathIndex === null || !this.route.paths[this.pathIndex]) return;
        const path: ITransportRoutePathDTO = this.route.paths[this.pathIndex];

        this.selectedPathCenter = undefined;
        this.selectedPathParking = 'ORIGIN';

        // VIEW
        this.transportMapService.setView(this.map, path.parking.latitude, path.parking.longitude);
    }

    setParkingDestination(): void {
        if (this.pathIndex === null || !this.route.paths[this.pathIndex]) return;
        const path: ITransportRoutePathDTO = this.route.paths[this.pathIndex];

        this.selectedPathCenter = undefined;
        this.selectedPathParking = 'DESTINATION';

        // VIEW
        this.transportMapService.setView(
            this.map,
            path.destination ? path.destination.latitude : this.route.destination.latitude,
            path.destination ? path.destination.longitude : this.route.destination.longitude,
        );
    }

    export(type: 'STATION' | 'PERSONNEL'): void {
        if (!this.route || this.pathIndex === null || !this.route.paths[this.pathIndex]) return;

        const pipe = new NgxHelperDurationPipe();
        const path: ITransportRoutePathDTO = this.route.paths[this.pathIndex];

        const content: string[][] = [];
        content.push(['مسیر', this.route.title]);
        content.push(['شماره مسیر', (this.pathIndex + 1).toString()]);
        content.push([]);
        if (type === 'STATION') content.push(['ایستگاه', 'عرض جغرافیایی', 'طول جغرافیایی', 'تعداد مسافر', 'زمان']);

        path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
            content.push([
                `ایستگاه ${index + 1}`,
                center.latitude.toString(),
                center.longitude.toString(),
                center.passenger.total.toString(),
                pipe.transform(center.time.total),
            ]);

            if (type === 'PERSONNEL') {
                center.locations.forEach((location: ITransportRouteLocationDTO) => {
                    location.passengers.forEach((passenger: ITransportRoutePassengerDTO) => {
                        content.push(['', passenger.code || '', passenger.name]);
                    });
                });
                content.push([]);
            }
        });
        content.push([
            'مقصد',
            path.destination ? path.destination.latitude.toString() : this.route.destination.latitude.toString(),
            path.destination ? path.destination.longitude.toString() : this.route.destination.longitude.toString(),
            path.passenger.toString(),
            pipe.transform(path.time),
        ]);

        const name: string =
            this.route.title + ` مسیر ${this.pathIndex + 1} ` + ' لیست ' + (type === 'STATION' ? 'ایستگاه‌ها' : 'مسافرها');
        this.downloadService.csv(name, content);
    }

    //#region MAP
    resetMap(): void {
        this.transportMapService.resetMap(this.map);
    }

    setMap(): void {
        this.resetMap();

        if (this.pathIndex === null) this.setRouteMap();
        else this.setPathMap();
    }

    setRouteMap(): void {
        if (this.showLines) {
            // LINE
            this.route.paths.forEach((path: ITransportRoutePathDTO) => {
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
                    path.destination
                        ? [path.destination.longitude, path.destination.latitude]
                        : [this.route.destination.longitude, this.route.destination.latitude],
                    '',
                    path.color,
                );
            });
        }

        // CENTER
        this.route.paths.forEach((path: ITransportRoutePathDTO) => {
            path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
                this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, path.color);
            });
        });

        if (this.showBoundaries) {
            // PATH PARKING
            this.route.paths
                .map((path) => path.parking)
                .filter(
                    (parking, index, arr) =>
                        arr.findIndex((p) => p.latitude === parking.latitude && p.longitude === parking.longitude) === index,
                )
                .forEach((parking) =>
                    this.transportMapService.setParkingLayer(this.map, parking.latitude, parking.longitude),
                );

            // DESTINATION
            this.transportMapService.setDestinationLayer(
                this.map,
                this.route.destination.latitude,
                this.route.destination.longitude,
            );

            // PATH DESTINATIONS
            this.route.paths.forEach((p) => {
                if (p.destination)
                    this.transportMapService.setDestinationLayer(this.map, p.destination.latitude, p.destination.longitude);
            });
        }
    }

    setPathMap(): void {
        if (!this.route || this.pathIndex === null || !this.route.paths[this.pathIndex]) return;

        const path: ITransportRoutePathDTO = this.route.paths[this.pathIndex];

        if (this.showLines) {
            // PARKING LINE
            this.transportMapService.setLineLayer(
                this.map,
                [path.parking.longitude, path.parking.latitude],
                [path.centers[0].longitude, path.centers[0].latitude],
                '',
                path.color,
            );

            // PATH LINE
            path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
                if (index === 0) return;
                const from: Coordinate = [path.centers[index - 1].longitude, path.centers[index - 1].latitude];
                const to: Coordinate = [center.longitude, center.latitude];
                this.transportMapService.setLineLayer(this.map, from, to, '', path.color);
            });

            // DESTINATION LINE
            this.transportMapService.setLineLayer(
                this.map,
                [path.centers[path.centers.length - 1].longitude, path.centers[path.centers.length - 1].latitude],
                path.destination
                    ? [path.destination.longitude, path.destination.latitude]
                    : [this.route.destination.longitude, this.route.destination.latitude],
                '',
                path.color,
            );
        }

        // CENTER
        path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
            this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, center.color);
        });

        if (this.showBoundaries) {
            // PARKING
            this.transportMapService.setParkingLayer(this.map, path.parking.latitude, path.parking.longitude);

            // DESTINATION
            this.transportMapService.setDestinationLayer(
                this.map,
                path.destination ? path.destination.latitude : this.route.destination.latitude,
                path.destination ? path.destination.longitude : this.route.destination.longitude,
            );
        }
    }
    //#endregion
}
