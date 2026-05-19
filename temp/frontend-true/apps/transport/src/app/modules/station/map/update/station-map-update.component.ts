import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Map } from 'ol';

import { Helper } from '@webilix/helper-library';
import {
    NgxHelperBottomSheetService,
    INgxHelperCoordinates,
    NgxHelperCoordinatesService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportStationCenterDTO,
    ITransportStationDTO,
    ITransportStationDistanceRq,
    ITransportStationDistanceRs,
    ITransportStationLocationDTO,
} from '@lib/apis';

import { TransportMapService } from '../../../../providers';

import { StationMapUpdateMoveComponent } from './move/station-map-update-move.component';
import { StationMapUpdateCenterComponent } from './center/station-map-update-center.component';

@Component({
    host: { selector: 'station-map-update' },
    templateUrl: './station-map-update.component.html',
    styleUrls: ['./station-map-update.component.scss'],
    standalone: false
})
export class StationMapUpdateComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public map!: Map;
    public station: ITransportStationDTO = this.activatedRoute.snapshot.data['station'];
    public selected?: { index: number; center: ITransportStationCenterDTO; location?: ITransportStationLocationDTO };

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
        this.map = this.transportMapService.initMap();

        this.transportMapService.initClick(
            this.map,
            () => (this.selected = undefined),
            (latitude: number, longitude: number) => {
                if (this.selected) return;
                this.station.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
                    if (center.latitude === latitude && center.longitude === longitude) this.selected = { index, center };
                    else
                        center.locations.forEach((location: ITransportStationLocationDTO) => {
                            if (location.latitude === latitude && location.longitude === longitude)
                                this.selected = { index, center, location };
                        });
                });
            },
        );

        this.setMap();
    }

    setMap(): void {
        this.transportMapService.resetMap(this.map);

        // LOCATION
        this.station.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
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
        this.station.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
            this.transportMapService.setCenterLayer(this.map, index, center.latitude, center.longitude, center.color);
        });
    }

    centerCoordinates(center: ITransportStationCenterDTO): void {
        this.ngxHelperCoordinatesService
            .get({ latitude: center.latitude, longitude: center.longitude })
            .then((coordinates: INgxHelperCoordinates) => {
                Object.assign(center, { latitude: coordinates.latitude });
                Object.assign(center, { longitude: coordinates.longitude });
                this.setMap();

                this.ngxHelperToastService.success('مختصات جغرافیایی ایستگاه با موفقیت تغییر داده شد.');
            });
    }

    locationCenter(index: number, center: ITransportStationCenterDTO, location: ITransportStationLocationDTO): void {
        if (center.locations.length < 2) return;

        this.ngxHelperBottomSheetService.open<{ color: string }>(
            StationMapUpdateCenterComponent,
            'ایجاد ایستگاه جدید',
            { data: { station: this.station, index, center, location } },
            (response) => {
                // Delete location from current center
                Object.assign(center, {
                    locations: center.locations.filter((l) => l.id !== location.id),
                });
                if (center.locations.length === 1) {
                    Object.assign(center, { latitude: center.locations[0].latitude });
                    Object.assign(center, { longitude: center.locations[0].longitude });
                }

                // Create new center
                this.station.centers.push({
                    color: Helper.COLOR.toRGB(response.color) || response.color,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    locations: [location],
                });

                this.setMap();

                this.selected = undefined;
                this.ngxHelperToastService.success('ایستگاه با موفقیت ایجاد شد.');
            },
        );
    }

    locationMove(index: number, center: ITransportStationCenterDTO, location: ITransportStationLocationDTO): void {
        this.ngxHelperBottomSheetService.open<{ index: number }>(
            StationMapUpdateMoveComponent,
            'تغییر ایستگاه',
            { data: { station: this.station, index, center, location } },
            (response) => {
                if (response.index === index) return;

                // Delete location from current center
                Object.assign(center, {
                    locations: center.locations.filter((l) => l.id !== location.id),
                });
                if (center.locations.length === 1) {
                    Object.assign(center, { latitude: center.locations[0].latitude });
                    Object.assign(center, { longitude: center.locations[0].longitude });
                }

                // Add location to new center
                this.station.centers[response.index].locations.push(location);

                // Delete centers with no location
                Object.assign(this.station, {
                    centers: this.station.centers.filter((c) => c.locations.length !== 0),
                });
                this.setMap();

                this.selected = undefined;
                this.ngxHelperToastService.success('ایستگاه مرتبط با مکان با موفقیت تغییر داده شد.');
            },
        );
    }

    save(): void {
        const ID: string = this.station.id;
        const body: ITransportStationDistanceRq = { centers: [], locations: [] };
        this.station.centers.forEach((center: ITransportStationCenterDTO, index: number) => {
            body.centers.push({
                index: index + 1,
                color: center.color,
                latitude: center.latitude,
                longitude: center.longitude,
            });
            center.locations.forEach((location: ITransportStationLocationDTO) =>
                body.locations.push({ center: index + 1, location: location.id }),
            );
        });
        this.apiService.request<ITransportStationDistanceRs>('TransportStationDistance', { body, ids: { ID } }, () => {
            this.router.navigate(['/station', 'map', this.station.id]);
            this.ngxHelperToastService.success('مشخصات ایستگاه با موفقیت ویرایش شد.');
        });
    }
}
