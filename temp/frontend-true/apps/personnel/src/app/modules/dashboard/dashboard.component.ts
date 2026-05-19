import { Component, OnInit } from '@angular/core';

import { ApiService, IPersonnelDashboardCountRs } from '@lib/apis';
import { IPageBlock } from '@lib/page';
import { UserService } from '@lib/providers';
import { PersonnelStatusInfo } from '@lib/shared';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false
})
export class DashboardComponent implements OnInit {
    public count: { loading: boolean; blocks: IPageBlock[][] } = { loading: true, blocks: [] };

    constructor(private readonly apiService: ApiService, private readonly userService: UserService) {}

    ngOnInit(): void {
        this.loadCount();
    }

    loadCount(): void {
        this.apiService.request<IPersonnelDashboardCountRs>('PersonnelDashboardCount', (response) => {
            this.count.loading = false;
            this.count.blocks = [
                [
                    { title: 'تعداد کل پرسنل', value: response.count },
                    {
                        title: `پرسنل ${PersonnelStatusInfo['ACTIVE'].title}`,
                        value: response.status.find((s) => s.type === 'ACTIVE')?.count || 0,
                    },
                ],
                [
                    {
                        title: `پرسنل ${PersonnelStatusInfo['SUSPEND'].title}`,
                        value: response.status.find((s) => s.type === 'SUSPEND')?.count || 0,
                    },
                    {
                        title: `پرسنل ${PersonnelStatusInfo['LEFT'].title}`,
                        value: response.status.find((s) => s.type === 'LEFT')?.count || 0,
                    },
                    {
                        title: `پرسنل ${PersonnelStatusInfo['FIRED'].title}`,
                        value: response.status.find((s) => s.type === 'FIRED')?.count || 0,
                    },
                ],
            ];
        });
    }
}
