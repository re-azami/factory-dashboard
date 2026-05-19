import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Map } from 'ol';

import { Helper } from '@webilix/helper-library';

import { ApiService, ITransportGroupDTO, ITransportLocationDTO, ITransportLocationMapRs } from '@lib/apis';

import { TransportMapService } from '../../../providers';

@Component({
    host: { selector: 'location-map' },
    templateUrl: './location-map.component.html',
    styleUrls: ['./location-map.component.scss'],
    standalone: false
})
export class LocationMapComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public group: ITransportGroupDTO = this.activatedRoute.snapshot.data['group'];

    public map!: Map;
    public loading: boolean = true;
    public location?: ITransportLocationDTO;
    public locations: ITransportLocationDTO[] = [];

    private query: string = '';

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly transportMapService: TransportMapService,
    ) {}

    ngOnInit(): void {
        const group: string = this.group.id;
        this.apiService.request<ITransportLocationMapRs>('TransportLocationMap', { params: { group } }, (response) => {
            this.loading = false;
            this.location = undefined;
            this.locations = response;

            setTimeout(() => {
                this.map = this.transportMapService.initMap();
                this.transportMapService.initClick(
                    this.map,
                    () => (this.location = undefined),
                    (latitude: number, longitude: number) => {
                        if (this.location) return;
                        this.location = this.locations.find((l) => l.latitude === latitude && l.longitude === longitude);
                    },
                );

                this.setMap();
            }, 0);
        });
    }

    setQuery(query: string): void {
        if (!Helper.IS.string(query)) return;

        query = query.trim();
        if (query === this.query) return;

        this.query = query;
        this.setMap();
    }

    setMap(): void {
        this.transportMapService.resetMap(this.map);

        this.locations
            .filter(
                (location: ITransportLocationDTO) =>
                    !this.query ||
                    location.title.indexOf(this.query) !== -1 ||
                    location.passengers.find((passenger) => passenger.name.indexOf(this.query) !== -1),
            )
            .forEach((location: ITransportLocationDTO) => {
                const layer = this.transportMapService.setLocationLayer(
                    this.map,
                    location.latitude,
                    location.longitude,
                    location.passengers.length,
                );
            });
    }
}
