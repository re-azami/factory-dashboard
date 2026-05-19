import { Component, Input, OnInit } from '@angular/core';

import { ApiService, ILoadCargoDTO, ILoadTruckCargoRs, ILoadTruckDTO } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    selector: 'truck-info-cargo',
    templateUrl: './truck-info-cargo.component.html',
    styleUrl: './truck-info-cargo.component.scss',
    standalone: false
})
export class TruckInfoCargoComponent implements OnInit {
    @Input({ required: true }) truck!: ILoadTruckDTO;

    public loadCargoInfo = LoadCargoInfo;

    public loading: boolean = true;
    public cargos: ILoadCargoDTO[] = [];

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        const ID: string = this.truck.id;
        this.apiService.request<ILoadTruckCargoRs>('LoadTruckCargo', { ids: { ID } }, (response) => {
            this.loading = false;
            this.cargos = response;
        });
    }
}
