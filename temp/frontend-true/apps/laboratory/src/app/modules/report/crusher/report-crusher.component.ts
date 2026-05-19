import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ILaboratoryCrusherCargoDTO,
    ILaboratoryCrusherCargoRs,
    ILaboratoryCrusherDataRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'report-crusher' },
    templateUrl: './report-crusher.component.html',
    styleUrl: './report-crusher.component.scss',
    standalone: false
})
export class ReportCrusherComponent {
    public data: ILaboratoryCrusherDataRs = this.activatedRoute.snapshot.data['data'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش بارهای سنگ شکن',
        toolbar: {
            route: ['/report', 'crusher'],
            params: [
                { name: 'party', type: 'SELECT', title: 'طرف حساب', options: this.data.party },
                { name: 'shipment', type: 'SELECT', title: 'محموله', options: this.data.shipment },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public cargos: ILaboratoryCrusherCargoDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratoryCrusherCargoDTO> = {
        type: 'بار',
        columns: [
            {
                title: 'بار',
                value: 'title',
                description: (data) => (data.type ? LoadCargoInfo[data.type].title : ''),
                action: (data) => ['/report', 'crusher', data.id],
            },
            {
                title: 'دوره زمانی',
                value: (data) => this.periodPipe({ from: data.date.from, to: data.date.to }),
                description: (data) => `${data.date.test} آزمایش`,
            },
            { title: 'طرف حساب', value: (data) => data.party?.title },
            { title: 'محموله', value: (data) => data.shipment?.title },
        ],
    };

    private periodPipe = new NgxHelperPeriodPipe().transform;

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const party: string = this.params?.params?.['party']?.param || '';
        const shipment: string = this.params?.params?.['shipment']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILaboratoryCrusherCargoRs>(
            'LaboratoryCrusherCargo',
            { params: { party, shipment, page } },
            (response) => {
                this.loading = false;
                this.cargos = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
