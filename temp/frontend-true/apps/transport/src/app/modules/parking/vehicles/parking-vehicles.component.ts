import { Component, OnInit } from '@angular/core';

import { ApiService, ITransportParkingDTO, ITransportParkingMapRs, ITransportParkingVehicleDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { TransportVehicleInfo } from '@lib/shared';

interface IVehicle {
    vehicle: ITransportParkingVehicleDTO;
    parking: ITransportParkingDTO;
}

@Component({
    host: { selector: 'parking-vehicles' },
    templateUrl: './parking-vehicles.component.html',
    styleUrls: ['./parking-vehicles.component.scss'],
    standalone: false
})
export class ParkingVehiclesComponent implements OnInit {
    public title: IPageTitle = {
        title: 'لیست ناوگان',
        actions: [{ type: 'RETURN', action: ['/parking'] }],
    };

    public loading: boolean = true;
    public vehicles: IVehicle[] = [];

    public list: IList<IVehicle> = {
        type: 'ناوگان',
        icon: (data) => TransportVehicleInfo[data.vehicle.type].icon,
        columns: [
            { title: 'نوع ناوگان', value: (data) => TransportVehicleInfo[data.vehicle.type].title, isDescription: true },
            { title: 'عنوان', value: (data) => data.vehicle.title, isTitle: true },
            { title: 'ظرفیت', value: (data) => data.vehicle.capacity, type: 'NUMBER' },
            {
                title: 'پارکینگ',
                value: (data) => data.parking.title,
                action: (data) => ['/parking', data.parking.id, 'vehicle'],
            },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.apiService.request<ITransportParkingMapRs>('TransportParkingMap', (response) => {
            this.loading = false;

            this.vehicles = [];
            response.forEach((parking: ITransportParkingDTO) =>
                parking.vehicles.forEach((vehicle: ITransportParkingVehicleDTO) => this.vehicles.push({ vehicle, parking })),
            );
        });
    }
}
