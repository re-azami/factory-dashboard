import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ApiService, ILoadCargoDTO, ILoadTruckCargoRs, ILoadTruckDTO } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'truck-cargo' },
    templateUrl: './truck-cargo.component.html',
    styleUrl: './truck-cargo.component.scss',
    standalone: false
})
export class TruckCargoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public loading: boolean = true;
    public cargos: ILoadCargoDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { truck: ILoadTruckDTO },
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.data.truck.id;
        this.apiService.request<ILoadTruckCargoRs>('LoadTruckCargo', { ids: { ID } }, (response) => {
            this.loading = false;
            this.cargos = response;
        });
    }
}
