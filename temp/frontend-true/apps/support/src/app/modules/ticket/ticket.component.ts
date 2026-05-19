import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, IPaginationDTO, ISupportTicketListDTO, ISupportTicketListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { App, AppInfo, AppList, SupportRequestInfo, SupportTicket, SupportTicketInfo, SupportTicketList } from '@lib/shared';

@Component({
    host: { selector: 'ticket' },
    templateUrl: './ticket.component.html',
    styleUrl: './ticket.component.scss',
    standalone: false
})
export class TicketComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'درخواست پشتیبانی',
        toolbar: {
            route: ['/ticket'],
            params: [
                {
                    name: 'app',
                    type: 'SELECT',
                    title: 'سرویس',
                    options: AppList.filter((app: App) => app !== 'SUPPORT')
                        .filter((app: App) => this.configService.hasApp(app))
                        .map((app: App) => ({ id: app, title: AppInfo[app].title })),
                },
                {
                    name: 'status',
                    type: 'SELECT',
                    title: 'وضعیت',
                    options: SupportTicketList.map((ticket: SupportTicket) => ({
                        id: ticket,
                        title: SupportTicketInfo[ticket].title,
                    })),
                },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public tickets: ISupportTicketListDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ISupportTicketListDTO> = {
        type: 'بار',
        icon: (data) => ({ icon: AppInfo[data.app].icon, color: SupportTicketInfo[data.status].color }),
        description: (data) => data.ticket,
        columns: [
            {
                title: 'عنوان',
                value: 'title',
                action: (data) => ['/ticket', data.id],
                description: (data) => AppInfo[data.app].title,
            },
            { title: 'نوع درخواست', value: (data) => SupportRequestInfo[data.type].title },
            { title: 'کاربر', value: (data) => data.user.name },
            { title: 'ثبت', value: (data) => data.date.create, type: 'DATE' },
            { title: 'وضعیت', value: (data) => SupportTicketInfo[data.status].title },
        ],
    };

    constructor(private readonly apiService: ApiService, private readonly configService: ConfigService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const app: string = this.params?.params?.['app']?.param || '';
        const status: string = this.params?.params?.['status']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ISupportTicketListRs>('SupportTicketList', { params: { app, status, page } }, (response) => {
            this.tickets = response.list;
            this.pagination = response.pagination;
            this.loading = false;
        });
    }
}
