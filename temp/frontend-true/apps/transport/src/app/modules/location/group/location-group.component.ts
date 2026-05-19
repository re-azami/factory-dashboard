import { Component, Input } from '@angular/core';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationMapRs,
    ITransportLocationPassengerDTO,
} from '@lib/apis';
import { IKmlCoordinates, TransportKmlService } from '../../../providers';

@Component({
    selector: 'location-group',
    templateUrl: './location-group.component.html',
    styleUrl: './location-group.component.scss',
    standalone: false
})
export class LocationGroupComponent {
    @Input({ required: true }) group!: ITransportGroupDTO;
    @Input({ required: false }) location?: ITransportLocationDTO;

    constructor(
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly transportKmlService: TransportKmlService,
    ) {}

    download(): void {
        if (this.group.location === 0) return;

        const group: string = this.group.id;
        this.apiService.request<ITransportLocationMapRs>('TransportLocationMap', { params: { group } }, (response) => {
            if (response.length === 0) {
                this.ngxHelperToastService.error('مکان ثبت نشده است.');
                return;
            }

            const coordinates: IKmlCoordinates[] = response.map((location: ITransportLocationDTO) => ({
                title: location.title,
                latitude: location.latitude,
                longitude: location.longitude,
                description: location.passengers.map((passenger: ITransportLocationPassengerDTO) => passenger.name),
            }));

            this.transportKmlService.download('لیست مکان‌ها', coordinates);
        });
    }
}
