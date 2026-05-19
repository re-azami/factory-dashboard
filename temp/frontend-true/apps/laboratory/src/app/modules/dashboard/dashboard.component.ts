import { Component, OnInit } from '@angular/core';

import { ApiService, ILaboratoryDashboardCountRs } from '@lib/apis';
import { IPageBlock } from '@lib/page';
import { UserService } from '@lib/providers';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false
})
export class DashboardComponent implements OnInit {
    public count: { loading: boolean; blocks: IPageBlock[][] } = { loading: true, blocks: [] };

    public dailyAccess: boolean = this.userService.hasAccess({ access: 'LABORATORY_DASHBOARD_DAILY' });

    constructor(private readonly apiService: ApiService, private readonly userService: UserService) {}

    ngOnInit(): void {
        this.apiService.request<ILaboratoryDashboardCountRs>('LaboratoryDashboardCount', (response) => {
            this.count.loading = false;
            this.count.blocks = [
                [
                    { title: 'روز', value: response.crusher.day },
                    { title: 'آزمایش', value: response.crusher.result },
                ],
                [
                    { title: 'روز', value: response.khatka.day },
                    { title: 'آزمایش', value: response.khatka.result },
                ],
                [
                    { title: 'بلین', value: response.blaine },
                    { title: 'دیویس تیوب', value: response.davis },
                    { title: 'درصد جامد', value: response.solid },
                    { title: 'بارهای روزانه', value: response.load },
                ],
            ];
        });
    }
}
