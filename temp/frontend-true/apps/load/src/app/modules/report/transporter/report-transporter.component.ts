import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadTransporterDTO, ILoadTransporterListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'report-transporter' },
    templateUrl: './report-transporter.component.html',
    styleUrl: './report-transporter.component.scss',
    standalone: false
})
export class ReportTransporterComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش باربری',
        toolbar: {
            route: ['/report', 'transporter'],
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
                { name: 'query', type: 'SEARCH' },
            ],
        },
    };

    public loading: boolean = true;
    public transporters: ILoadTransporterDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadTransporterDTO> = {
        type: 'محوله',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/report', 'transporter', data.id] },
            { title: 'کد باربری', value: 'code', english: true },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    loadList(value: INgxHelperParamValue): void {
        const status: string = value.params?.['status']?.param || '';
        const query: string = value.params?.['query']?.param || '';
        const page: string = value.page?.toString() || '1';
        this.apiService.request<ILoadTransporterListRs>(
            'LoadTransporterList',
            { params: { status, query, page } },
            (response) => {
                this.loading = false;
                this.transporters = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
