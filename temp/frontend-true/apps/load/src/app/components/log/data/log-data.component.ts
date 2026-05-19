import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { NgxHelperListModule } from '@webilix/ngx-helper/list';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ApiService, ILoadLogDataDTO, ILoadLogDataRs } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { LoadActionInfo, LoadActionList } from '@lib/shared';

@Component({
    host: { selector: 'log-data' },
    imports: [NgxHelperListModule, NgxHelperLoaderModule, NgxHelperPipeModule, MaterialModule],
    templateUrl: './log-data.component.html',
    styleUrl: './log-data.component.scss'
})
export class LogDataComponent implements OnInit {
    public loadActionList = LoadActionList;
    public loadActionInfo = LoadActionInfo;

    public loading: boolean = true;
    public logs: ILoadLogDataDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { type: 'PARTY'; id: string },
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.data.id;
        const type: string = this.data.type;
        this.apiService.request<ILoadLogDataRs>('LoadLogData', { ids: { ID }, params: { type } }, (response) => {
            this.loading = false;
            this.logs = response;
        });
    }
}
