import { Component, HostBinding, OnInit } from '@angular/core';
import { Map } from 'ol';

import { ApiService, ITransportParkingDTO, ITransportParkingMapRs } from '@lib/apis';

import { TransportMapService } from '../../../providers';

@Component({
    host: { selector: 'parking-map' },
    templateUrl: './parking-map.component.html',
    styleUrls: ['./parking-map.component.scss'],
    standalone: false
})
export class ParkingMapComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public map!: Map;
    public loading: boolean = true;
    public parking?: ITransportParkingDTO;
    public parkings: ITransportParkingDTO[] = [];

    constructor(private readonly apiService: ApiService, private readonly transportMapService: TransportMapService) {}

    ngOnInit(): void {
        this.apiService.request<ITransportParkingMapRs>('TransportParkingMap', (response) => {
            this.loading = false;
            this.parkings = response;

            setTimeout(this.setMap.bind(this), 0);
        });
    }

    setMap(): void {
        this.map = this.transportMapService.initMap();
        this.transportMapService.initClick(
            this.map,
            () => (this.parking = undefined),
            (latitude: number, longitude: number) => {
                if (this.parking) return;
                this.parking = this.parkings.find((p) => p.latitude === latitude && p.longitude === longitude);
            },
        );

        this.parkings.forEach((parking: ITransportParkingDTO) => {
            this.transportMapService.setParkingLayer(this.map, parking.latitude, parking.longitude, parking.vehicles.length);
        });
    }
}
