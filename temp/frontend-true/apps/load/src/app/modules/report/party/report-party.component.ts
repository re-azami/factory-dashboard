import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadPartyDTO, ILoadPartyListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LoadCargoInfo, LoadCargoList } from '@lib/shared';

@Component({
    host: { selector: 'report-party' },
    templateUrl: './report-party.component.html',
    styleUrl: './report-party.component.scss',
    standalone: false
})
export class ReportPartyComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش طرف حساب',
        toolbar: {
            route: ['/report', 'party'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    icon: 'task_alt',
                    options: [
                        { title: 'فعال', value: 'ACTIVE', icon: 'check_circle' },
                        { title: 'غیرفعال', value: 'DEACTIVE', icon: 'cancel' },
                    ],
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
    public parties: ILoadPartyDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadPartyDTO> = {
        type: 'طرف حساب',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/report', 'party', data.id] },
            { title: 'نوع بار', value: (data) => data.cargo.map((c) => LoadCargoInfo[c].title).join('، ') },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    loadList(value: INgxHelperParamValue): void {
        const status: string = value.params?.['status']?.param || '';
        const cargo: string = value.params?.['cargo']?.param || '';
        const query: string = value.params?.['query']?.param || '';
        const page: string = value.page?.toString() || '1';
        this.apiService.request<ILoadPartyListRs>(
            'LoadPartyList',
            { params: { status, cargo, query, page } },
            (response) => {
                this.loading = false;
                this.parties = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
