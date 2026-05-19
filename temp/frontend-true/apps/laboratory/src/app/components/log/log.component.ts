import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { NgxHelperListModule } from '@webilix/ngx-helper/list';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ApiService, ApiTypes, ILaboratoryTestLogDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { LaboratoryActionInfo } from '@lib/shared';

@Component({
    host: { selector: 'log' },
    imports: [NgxHelperListModule, NgxHelperLoaderModule, NgxHelperPipeModule, MaterialModule],
    templateUrl: './log.component.html',
    styleUrl: './log.component.scss'
})
export class LogComponent implements OnInit {
    public laboratoryActionInfo = LaboratoryActionInfo;

    public loading: boolean = true;
    public logs: ILaboratoryTestLogDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { api: ApiTypes; id: string },
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.data.id;
        this.apiService.request<ILaboratoryTestLogDTO[]>(this.data.api, { ids: { ID } }, (response) => {
            this.loading = false;
            this.logs = response;
        });
    }
}
