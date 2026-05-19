import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Map } from 'ol';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IOptionDTO,
    ITransportStationCenterDTO,
    ITransportStationDTO,
    ITransportStationInfoRs,
} from '@lib/apis';
import { Helpers } from '@lib/shared';

import { TransportMapService } from '../../../providers';

@Component({
    host: { selector: 'station-compare' },
    templateUrl: './station-compare.component.html',
    styleUrls: ['./station-compare.component.scss'],
    standalone: false
})
export class StationCompareComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public map!: Map;
    public loading: boolean = true;
    public view: 'STATION' | 'LOCATION' | 'PASSENGER' = 'PASSENGER';
    public stations: { id: string; title: string; color: string; show?: boolean; dto?: ITransportStationDTO }[] = [];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly transportMapService: TransportMapService,
    ) {}

    ngOnInit(): void {
        const stations: IOptionDTO[] = this.activatedRoute.snapshot.data['stations'];
        if (stations.length === 0) {
            this.router.navigate(['/station']);
            this.ngxHelperToastService.error('ایستگاه ثبت نشده است.');
            return;
        }

        this.loading = false;
        this.map = this.transportMapService.initMap();
        this.stations = stations.map((station: IOptionDTO) => ({ ...station, color: this.getRandomColor() }));
    }

    private colorIndex: number = -1;
    private getRandomColor(): string {
        this.colorIndex = ++this.colorIndex % 3;
        const r: number = (Math.floor(Math.random() * 150) + 50) * (this.colorIndex === 0 ? 0 : 1);
        const g: number = (Math.floor(Math.random() * 150) + 50) * (this.colorIndex === 1 ? 0 : 1);
        const b: number = (Math.floor(Math.random() * 150) + 50) * (this.colorIndex === 2 ? 0 : 1);
        return `rgb(${r}, ${g}, ${b})`;
    }

    setColors(): void {
        this.stations.forEach((station) => (station.color = this.getRandomColor()));
        this.setMap();
    }

    loadStation(ID: string): void {
        const station = Helpers.getItemById(ID, this.stations);
        if (!station) return;

        station.show = !station.show;
        if (!station.show || station.dto) return this.setMap();

        this.apiService.request<ITransportStationInfoRs>(
            'TransportStationInfo',
            { ids: { ID } },
            (response) => {
                station.dto = response;
                this.setMap();
            },
            () => (station.show = false),
        );

        this.setMap();
    }

    setMap(): void {
        this.transportMapService.resetMap(this.map);

        this.stations.forEach((station) => {
            if (!station.show || !station.dto) return;

            station.dto.centers.forEach((center: ITransportStationCenterDTO, index: number) =>
                this.transportMapService.setCenterLayer(
                    this.map,
                    this.view === 'STATION'
                        ? index
                        : this.view === 'LOCATION'
                        ? center.locations.length - 1
                        : center.locations.reduce((sum: number, l) => sum + l.passengers.length, 0) - 1,
                    center.latitude,
                    center.longitude,
                    station.color,
                ),
            );
        });
    }
}
