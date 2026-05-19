import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Map } from 'ol';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

import { Helper } from '@webilix/helper-library';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationMapRs,
    ITransportStationCalculateRq,
    ITransportStationCalculateRs,
    ITransportStationCenterDTO,
    ITransportStationDTO,
    ITransportStationLocationDTO,
} from '@lib/apis';

import { TransportMapService } from '../../../../providers';

import { StationCreateComponent } from '../../create/station-create.component';

import { StationMapCreateOptionComponent } from './option/station-map-create-option.component';
import { UserService } from '@lib/providers';

@Component({
    host: { selector: 'station-map-create' },
    templateUrl: './station-map-create.component.html',
    styleUrls: ['./station-map-create.component.scss'],
    standalone: false
})
export class StationMapCreateComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public group: ITransportGroupDTO = this.activatedRoute.snapshot.data['group'];

    public map!: Map;
    public loading: boolean = true;
    public locations: ITransportLocationDTO[] = [];
    public selectedLocation?: ITransportLocationDTO;

    public centerIndex: number | null = null;
    public centers: ITransportStationCenterDTO[] = [];
    public selectedCenter?: { index: number; center: ITransportStationCenterDTO; location?: ITransportStationLocationDTO };

    public station?: ITransportStationDTO;

    public distanceIndex: number = 0;
    public distances: {
        station: number;
        color: string;
        location: ITransportStationLocationDTO;
        distance: number;
        time: number;
    }[] = [];

    public routeAccess: boolean = this.userService.hasAccess({ access: 'TRANSPORT_ROLE_ROUTE' });

    private clickKey?: EventsKey;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly transportMapService: TransportMapService,
    ) {}

    ngOnInit(): void {
        this.map = this.transportMapService.initMap();

        const station: ITransportStationDTO = this.activatedRoute.snapshot.data['station'];
        if (station) {
            this.loading = false;
            this.setStation(station);
        } else {
            const group: string = this.group.id;
            this.apiService.request<ITransportLocationMapRs>('TransportLocationMap', { params: { group } }, (response) => {
                this.loading = false;
                this.locations = response;

                this.setLocationsMap();
            });
        }
    }

    calculate(): void {
        if (this.locations.length === 0) return;

        this.ngxHelperBottomSheetService.open<{ count: number }>(
            StationMapCreateOptionComponent,
            'محاسبه ایستگاه‌ها',
            { data: { locations: this.locations } },
            (response) => {
                const locations: string[] = this.locations.map((location: ITransportLocationDTO) => location.id);
                const body: ITransportStationCalculateRq = { locations, count: response.count };
                this.apiService.request<ITransportStationCalculateRs>('TransportStationCalculate', { body }, (response) => {
                    this.centerIndex = null;
                    this.centers = response;
                    this.setCenters();
                });
            },
        );
    }

    create(): void {
        if (this.centers.length === 0) return;

        this.ngxHelperBottomSheetService.open<ITransportStationDTO>(
            StationCreateComponent,
            'ثبت ایستگاه',
            { data: { centers: this.centers } },
            (response) => {
                this.router.navigate(['/station', 'map', response.id]);
                this.setStation(response);
                this.ngxHelperToastService.success('محاسبه ایستگاه‌ها با موفقیت ثبت شد.');
            },
        );
    }

    setStation(station: ITransportStationDTO): void {
        this.station = station;
        this.locations = [];
        this.centers = station.centers;
        this.setCenters();
    }

    setCenters(): void {
        this.setCentersMap();

        this.distanceIndex = 0;
        this.distances = this.centers
            .map((center: ITransportStationCenterDTO, index: number) =>
                center.locations.map((location: ITransportStationLocationDTO) => ({
                    station: index,
                    color: center.color,
                    location,
                    distance: location.distance,
                    time: location.time,
                })),
            )
            .flat()
            .sort((d1, d2) => d2.distance - d1.distance);
    }

    setCenterIndex(): void {
        if (this.centerIndex === null || !this.centers[this.centerIndex]) {
            this.centerIndex = null;
            this.setCentersMap();
        } else this.setCenterIndexMap();
    }

    //#region CLICK
    setLocationClick(): void {
        this.clickKey = this.transportMapService.initClick(
            this.map,
            () => (this.selectedLocation = undefined),
            (latitude: number, longitude: number) => {
                if (this.selectedLocation) return;
                this.selectedLocation = this.locations.find((l) => l.latitude === latitude && l.longitude === longitude);
            },
        );
    }

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
    //#endregion

    //#region MAP
    resetMap(): void {
        this.transportMapService.resetMap(this.map);

        if (this.clickKey) unByKey(this.clickKey);
        this.selectedLocation = undefined;
        this.selectedCenter = undefined;
    }

    setLocationsMap(): void {
        this.resetMap();

        // LOCATION
        this.locations.forEach((location: ITransportLocationDTO) =>
            this.transportMapService.setLocationLayer(
                this.map,
                location.latitude,
                location.longitude,
                location.passengers.length,
            ),
        );

        // CLICK
        this.setLocationClick();
    }

    setCentersMap(): void {
        this.resetMap();

        // LOCATION
        this.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
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

    setCenterIndexMap(): void {
        this.resetMap();

        const index: number = this.centerIndex as number;
        const center: ITransportStationCenterDTO = this.centers[index];

        // LINE
        center.locations.forEach((location: ITransportStationLocationDTO) => {
            this.transportMapService.setLineLayer(
                this.map,
                [center.longitude, center.latitude],
                [location.longitude, location.latitude],
                Helper.NUMBER.format(location.distance, 'EN') + '\n' + Helper.TIME.getDuration(location.time),
                center.color,
            );
        });

        // LOCATION
        center.locations.forEach((location: ITransportStationLocationDTO) => {
            this.transportMapService.setLocationLayer(
                this.map,
                location.latitude,
                location.longitude,
                location.passengers.length,
                center.color,
            );
        });

        // CENTER
        this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, center.color);

        // VIEW
        this.transportMapService.setView(this.map, center.latitude, center.longitude);

        // CLICK
        this.setCenterClick();
    }
    //#endregion
}
