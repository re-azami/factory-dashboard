import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { NgxHelperListModule } from '@webilix/ngx-helper/list';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ApiService, ApiTypes, IWarehouseLogDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { WarehouseLogInfo } from '@lib/shared';

@Component({
    host: { selector: 'log' },
    imports: [CommonModule, NgxHelperListModule, NgxHelperLoaderModule, NgxHelperPipeModule, MaterialModule],
    templateUrl: './log.component.html',
    styleUrl: './log.component.scss'
})
export class LogComponent implements OnInit {
    public logInfo = WarehouseLogInfo;

    public loading: boolean = true;
    public logs: IWarehouseLogDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { api: ApiTypes; ids: { [key: string]: string } },
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<IWarehouseLogDTO[]>(this.data.api, { ids: this.data.ids }, (response) => {
            this.loading = false;
            this.logs = response;
        });
    }
}
