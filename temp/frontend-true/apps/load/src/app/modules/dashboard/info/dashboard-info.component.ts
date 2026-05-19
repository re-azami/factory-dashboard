import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { LoadCargo, LoadCargoInfo, LoadFlowInfo } from '@lib/shared';

import { ApiService, ILoadSettingDTO, ILoadSettingInfoRs } from '@lib/apis';

import { LoadSettingService } from '../../../providers';

@Component({
    host: { selector: 'dashboard-info' },
    templateUrl: './dashboard-info.component.html',
    styleUrl: './dashboard-info.component.scss',
    standalone: false
})
export class DashboardInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;
    public loadFlowInfo = LoadFlowInfo;

    public type: LoadCargo = this.data.type;

    public loading: boolean = true;
    public setting!: ILoadSettingDTO;

    public getStep = this.loadSettingService.getStep;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { type: LoadCargo },
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        const cargo: LoadCargo = this.type;
        this.apiService.request<ILoadSettingInfoRs>('LoadSettingInfo', { params: { cargo } }, (response) => {
            this.loading = false;
            this.setting = response;
        });
    }
}
