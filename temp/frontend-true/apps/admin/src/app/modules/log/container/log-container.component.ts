import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILogContainerDTO, ILogContainerRs, IPaginationDTO } from '@lib/apis';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'log-container' },
    standalone: false,
    templateUrl: './log-container.component.html',
    styleUrl: './log-container.component.scss',
})
export class LogContainerComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش کانتینرهای داکر',
        toolbar: { route: ['/log', 'container'] },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public logs: ILogContainerDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    constructor(private readonly apiService: ApiService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILogContainerRs>('LogContainer', { params: { page } }, (response) => {
            this.loading = false;
            this.logs = response.list;
            this.pagination = response.pagination;
        });
    }
}
