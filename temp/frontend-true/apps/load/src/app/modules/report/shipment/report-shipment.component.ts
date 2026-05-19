import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadShipmentDTO, ILoadShipmentListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'report-shipment' },
    templateUrl: './report-shipment.component.html',
    styleUrl: './report-shipment.component.scss',
    standalone: false
})
export class ReportShipmentComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش محموله',
        toolbar: {
            route: ['/report', 'shipment'],
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
    public shipments: ILoadShipmentDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadShipmentDTO> = {
        type: 'محوله',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/report', 'shipment', data.id] },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    loadList(value: INgxHelperParamValue): void {
        const status: string = value.params?.['status']?.param || '';
        const query: string = value.params?.['query']?.param || '';
        const page: string = value.page?.toString() || '1';
        this.apiService.request<ILoadShipmentListRs>('LoadShipmentList', { params: { status, query, page } }, (response) => {
            this.loading = false;
            this.shipments = response.list;
            this.pagination = response.pagination;
        });
    }
}
