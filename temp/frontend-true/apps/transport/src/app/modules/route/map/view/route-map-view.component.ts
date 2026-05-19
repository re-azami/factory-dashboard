import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';
import { NgxHelperDurationPipe } from '@webilix/ngx-helper/pipe';

import {
    ITransportRouteCenterDTO,
    ITransportRouteDTO,
    ITransportRouteLocationDTO,
    ITransportRoutePassengerDTO,
    ITransportRoutePathDTO,
} from '@lib/apis';
import { ConfigService, DownloadService } from '@lib/providers';
import { TransportVehicleInfo } from '@lib/shared';

import { TransportMapService } from '../../../../providers';
import { AppCoordinates } from '../../../../app.coordinate';

import { RouteReverseComponent } from '../../reverse/route-reverse.component';
import { RouteCalculateComponent } from '../../calculate/route-calculate.component';
import { RouteColorComponent } from '../../color/route-color.component';

@Component({
    host: { selector: 'route-map-view' },
    templateUrl: './route-map-view.component.html',
    styleUrls: ['./route-map-view.component.scss'],
    standalone: false
})
export class RouteMapViewComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public applicationTitle: string = this.configService.applicationTitle;
    public transportVehicleInfo = TransportVehicleInfo;

    public route: ITransportRouteDTO = this.activatedRoute.snapshot.data['route'];
    public isEsm: boolean =
        this.route.destination.latitude === AppCoordinates.SITE.latitude &&
        this.route.destination.longitude === AppCoordinates.SITE.longitude;

    public map!: Map;
    public selectedPathCenter?: {
        pathIndex: number;
        path: ITransportRoutePathDTO;
        centerIndex: number;
        center: ITransportRouteCenterDTO;
    };
    public selectedPathParking?: 'ORIGIN' | 'DESTINATION';

    public pathIndex: number | null = this.route.paths.length === 1 ? 0 : null;

    public exportMenu: NgxHelperMenu[] = [
        { title: 'لیست ایستگاه‌ها', click: () => this.export('STATION') },
        { title: 'لیست مسافرها', click: () => this.export('PERSONNEL') },
    ];

    private durationPipe = new NgxHelperDurationPipe();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly configService: ConfigService,
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

        if (this.route.paths.length === 1) this.setPathIndexMap();
        else this.setPathsMap();
    }

    reversePath(): void {
        if (this.pathIndex === null) return;

        this.ngxHelperBottomSheetService.open<ITransportRouteDTO>(
            RouteReverseComponent,
            'معکوس کردن مسیر',
            { data: { route: this.route, pathIndex: this.pathIndex } },
            (response) => {
                this.route = response;
                this.setPathIndexMap();
            },
        );
    }

    setColors(): void {
        this.ngxHelperBottomSheetService.open<ITransportRouteDTO>(
            RouteColorComponent,
            'انتخاب رنگ مسیرها',
            { data: { route: this.route } },
            (response) => {
                this.route = response;
                this.setPathIndex();
            },
        );
    }

    screenshot(): void {
        const resolution = this.map.getView().getResolution();
        if (resolution === undefined) return;

        let minLat: number = Infinity;
        let maxLat: number = -Infinity;
        let minLong: number = Infinity;
        let maxLong: number = -Infinity;

        this.route.paths.forEach((path: ITransportRoutePathDTO, index: number) => {
            if (this.pathIndex !== null && index !== this.pathIndex) return;

            // PARKING
            if (
                path.parking.latitude !== AppCoordinates.SITE.latitude ||
                path.parking.longitude !== AppCoordinates.SITE.longitude
            ) {
                if (minLat > path.parking.latitude) minLat = path.parking.latitude;
                if (maxLat < path.parking.latitude) maxLat = path.parking.latitude;
                if (minLong > path.parking.longitude) minLong = path.parking.longitude;
                if (maxLong < path.parking.longitude) maxLong = path.parking.longitude;
            }

            // CENTERS
            path.centers.forEach((center: ITransportRouteCenterDTO) => {
                if (center.latitude === AppCoordinates.SITE.latitude && center.longitude === AppCoordinates.SITE.longitude)
                    return;

                if (minLat > center.latitude) minLat = center.latitude;
                if (maxLat < center.latitude) maxLat = center.latitude;
                if (minLong > center.longitude) minLong = center.longitude;
                if (maxLong < center.longitude) maxLong = center.longitude;
            });

            // DESTINATION
            const latitude: number = path.destination?.latitude || this.route.destination.latitude;
            const longitude: number = path.destination?.longitude || this.route.destination.longitude;
            if (latitude !== AppCoordinates.SITE.latitude || longitude !== AppCoordinates.SITE.longitude) {
                if (minLat > latitude) minLat = latitude;
                if (maxLat < latitude) maxLat = latitude;
                if (minLong > longitude) minLong = longitude;
                if (maxLong < longitude) maxLong = longitude;
            }
        });

        minLat -= 0.0025;
        maxLat += 0.0025;
        minLong -= 0.0025;
        maxLong += 0.0025;
    }

    calculate(): void {
        if (this.pathIndex === null) return;

        this.ngxHelperBottomSheetService.open<ITransportRouteDTO>(RouteCalculateComponent, 'مشاهده فاصله ایستگاه‌ها', {
            data: { route: this.route, pathIndex: this.pathIndex },
            padding: '0',
        });
    }

    export(type: 'STATION' | 'PERSONNEL'): void {
        if (this.pathIndex === null) return;

        const pipe = new NgxHelperDurationPipe();
        const path = this.route.paths[this.pathIndex];

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

    setPathIndex(): void {
        if (this.pathIndex === null || !this.route.paths[this.pathIndex]) {
            this.pathIndex = null;
            this.setPathsMap();
        } else this.setPathIndexMap();
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

    //#region MAP
    resetMap(): void {
        this.transportMapService.resetMap(this.map);

        this.selectedPathCenter = undefined;
        this.selectedPathParking = undefined;

        this.route.centers.forEach((center: ITransportRouteCenterDTO) =>
            this.transportMapService.setEmptyCenterLayer(this.map, center.latitude, center.longitude),
        );
    }

    setPathsMap(): void {
        this.resetMap();

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

        // CENTER
        this.route.paths.forEach((path: ITransportRoutePathDTO) => {
            path.centers.forEach((center: ITransportRouteCenterDTO, index: number) => {
                this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, center.color);
            });
        });

        // PATH PARKING
        this.route.paths
            .map((path) => path.parking)
            .filter(
                (parking, index, arr) =>
                    arr.findIndex((p) => p.latitude === parking.latitude && p.longitude === parking.longitude) === index,
            )
            .forEach((parking) => this.transportMapService.setParkingLayer(this.map, parking.latitude, parking.longitude));

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

    setPathIndexMap(): void {
        this.resetMap();

        const pathIndex: number = this.pathIndex as number;
        const path: ITransportRoutePathDTO = this.route.paths[pathIndex];

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
            path.destination
                ? [path.destination.longitude, path.destination.latitude]
                : [this.route.destination.longitude, this.route.destination.latitude],
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

        // DESTINATION
        this.transportMapService.setDestinationLayer(
            this.map,
            path.destination ? path.destination.latitude : this.route.destination.latitude,
            path.destination ? path.destination.longitude : this.route.destination.longitude,
        );
    }
    //#endregion
}
