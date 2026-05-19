import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationMapRs,
    ITransportLocationPassengerDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { TransportPassenger, TransportPassengerInfo, TransportPassengerList } from '@lib/shared';

interface IPassenger {
    passenger: ITransportLocationPassengerDTO;
    location: ITransportLocationDTO;
}

@Component({
    host: { selector: 'location-passengers' },
    templateUrl: './location-passengers.component.html',
    styleUrls: ['./location-passengers.component.scss'],
    standalone: false
})
export class LocationPassengersComponent implements OnInit {
    public group: ITransportGroupDTO = this.activatedRoute.snapshot.data['group'];

    public title: IPageTitle = {
        title: 'لیست مسافرها',
        toolbar: {
            route: ['/location', this.group.id, 'passengers'],
            params: [
                {
                    name: 'type',
                    type: 'MENU',
                    icon: 'wc',
                    options: TransportPassengerList.map((passenger: TransportPassenger) => ({
                        title: TransportPassengerInfo[passenger].title,
                        value: passenger,
                    })),
                },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [{ type: 'RETURN', action: ['/location', this.group.id] }],
    };

    public loading: boolean = true;
    public passengers: IPassenger[] = [];
    public filtered: IPassenger[] = [];

    public list: IList<IPassenger> = {
        type: 'مسافر',
        icon: (data) => TransportPassengerInfo[data.passenger.type].icon,
        columns: [
            { title: 'نوع مسافر', value: (data) => TransportPassengerInfo[data.passenger.type].title, isDescription: true },
            { title: 'نام و نام خانوادگی', value: (data) => data.passenger.name, isTitle: true },
            { title: 'کد پرسنلی', value: (data) => data.passenger.code, english: true },
            {
                title: 'مکان',
                value: (data) => data.location.title,
                action: (data) => ['/location', this.group.id, data.location.id, 'passenger'],
            },
        ],
    };

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        const group: string = this.group.id;
        this.apiService.request<ITransportLocationMapRs>('TransportLocationMap', { params: { group } }, (response) => {
            this.loading = false;

            this.passengers = [];
            response.forEach((location: ITransportLocationDTO) =>
                location.passengers.forEach((passenger: ITransportLocationPassengerDTO) =>
                    this.passengers.push({ passenger, location }),
                ),
            );

            this.passengers = this.passengers.sort((p1, p2) => p1.passenger.name.localeCompare(p2.passenger.name));
        });
    }

    loadList(value?: INgxHelperParamValue): void {
        const type: string = value?.params?.['type']?.param || '';
        const query: string = value?.params?.['query']?.param || '';

        this.filtered =
            !type && !query
                ? this.passengers
                : this.passengers.filter((passenger: IPassenger) => {
                      return (
                          (!type || passenger.passenger.type === type) &&
                          (!query || passenger.passenger.name.indexOf(query) !== -1)
                      );
                  });
    }
}
