import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadCargoDTO, ILoadCargoListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LoadCargoInfo, LoadCargoList, LoadStatus, LoadStatusInfo, LoadStatusList } from '@lib/shared';

@Component({
    host: { selector: 'report-cargo' },
    templateUrl: './report-cargo.component.html',
    styleUrl: './report-cargo.component.scss',
    standalone: false
})
export class ReportCargoComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش بار',
        toolbar: {
            route: ['/report', 'cargo'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    icon: 'task_alt',
                    options: LoadStatusList.map((status: LoadStatus) => ({
                        value: status,
                        title: LoadStatusInfo[status].title,
                    })),
                },
                {
                    name: 'cargo',
                    type: 'SELECT',
                    title: 'نوع بار',
                    options: LoadCargoList.map((c) => ({ id: c, title: LoadCargoInfo[c].title })),
                },
                { name: 'query', type: 'SEARCH' },
            ],
        },
    };

    public loading: boolean = true;
    public cargos: ILoadCargoDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadCargoDTO> = {
        type: 'بار',
        isDeactive: (data) => data.status === 'DONE',
        icon: (data) => LoadStatusInfo[data.status].icon,
        columns: [
            {
                title: 'عنوان',
                value: 'title',
                action: (data) => ['/report', 'cargo', data.id],
                color: (data) => LoadStatusInfo[data.status].color,
            },
            { title: 'وضعیت', value: (data) => LoadStatusInfo[data.status].title },
            { title: 'نوع بار', value: (data) => LoadCargoInfo[data.type].title, isDescription: true },
            { title: 'طرف حساب', value: (data) => data.party?.title },
            { title: 'محموله', value: (data) => data.shipment?.title },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    loadList(value: INgxHelperParamValue): void {
        const status: string = value.params?.['status']?.param || '';
        const cargo: string = value.params?.['cargo']?.param || '';
        const party: string = '';
        const shipment: string = '';
        const query: string = value.params?.['query']?.param || '';
        const page: string = value.page?.toString() || '1';
        this.apiService.request<ILoadCargoListRs>(
            'LoadCargoList',
            { params: { status, cargo, party, shipment, query, page } },
            (response) => {
                this.loading = false;
                this.cargos = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
