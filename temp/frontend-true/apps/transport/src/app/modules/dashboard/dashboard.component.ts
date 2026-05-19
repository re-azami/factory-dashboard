import { Component, OnInit } from '@angular/core';

import { ApiService, ITransportRouteDashboardRs } from '@lib/apis';
import { IPageBlock } from '@lib/page';
import { UserService } from '@lib/providers';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit {
    public loading: boolean = true;
    public blocks: IPageBlock[][] = [];

    constructor(private readonly apiService: ApiService, private readonly userService: UserService) {}

    ngOnInit(): void {
        this.loadRoute();
    }

    loadRoute(): void {
        this.apiService.request<ITransportRouteDashboardRs>('TransportRouteDashboard', (response) => {
            this.loading = false;
            this.blocks = [
                [
                    { title: 'گروه', value: response.route },
                    { title: 'مسیر', value: response.path },
                ],
                [
                    { title: 'ایستگاه', value: response.center },
                    { title: 'پرسنل', value: +response.passenger.toFixed() },
                ],
            ];
        });
    }
}
