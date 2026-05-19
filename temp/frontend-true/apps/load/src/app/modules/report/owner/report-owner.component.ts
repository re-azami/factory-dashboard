import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadOwnerDTO, ILoadOwnerListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'report-owner' },
    templateUrl: './report-owner.component.html',
    styleUrl: './report-owner.component.scss',
    standalone: false
})
export class ReportOwnerComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش مالک',
        toolbar: {
            route: ['/report', 'owner'],
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
    public owners: ILoadOwnerDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadOwnerDTO> = {
        type: 'مالک',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            {
                title: 'عنوان',
                value: (data) => `${data.name.first} ${data.name.last}`,
                action: (data) => ['/report', 'owner', data.id],
            },
            { value: 'mobile', type: 'MOBILE', copy: (data) => data.mobile },
            { value: 'nationalCode', type: 'NATIONAL-CODE', copy: (data) => data.nationalCode },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    loadList(value: INgxHelperParamValue): void {
        const status: string = value.params?.['status']?.param || '';
        const query: string = value.params?.['query']?.param || '';
        const page: string = value.page?.toString() || '1';
        this.apiService.request<ILoadOwnerListRs>('LoadOwnerList', { params: { status, query, page } }, (response) => {
            this.loading = false;
            this.owners = response.list;
            this.pagination = response.pagination;
        });
    }
}
