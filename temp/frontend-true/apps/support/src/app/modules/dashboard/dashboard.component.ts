import { Component, OnInit } from '@angular/core';

import { ApiService, ISupportTicketDashboardRs } from '@lib/apis';
import { IPageBlock } from '@lib/page';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false
})
export class DashboardComponent implements OnInit {
    public ticket: { loading: boolean; blocks: IPageBlock[] } = { loading: true, blocks: [] };

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.loadTicket();
    }

    loadTicket(): void {
        this.apiService.request<ISupportTicketDashboardRs>('SupportTicketDashboard', (response) => {
            this.ticket.loading = false;
            this.ticket.blocks = [
                { title: 'درخواست پشتیبانی', value: response.count },
                { title: 'پاسخ داده نشده', value: response.pending },
            ];
        });
    }
}
