import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILogResponseDTO, ILogResponseRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    host: { selector: 'log-response' },
    templateUrl: './log-response.component.html',
    styleUrls: ['./log-response.component.scss'],
    standalone: false
})
export class LogResponseComponent {
    public appInfo = AppInfo;

    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش پاسخ‌ها',
        toolbar: {
            route: ['/log', 'response'],
            params: [
                {
                    name: 'app',
                    type: 'SELECT',
                    title: 'سرویس',
                    options: AppList.filter((a: App) => this.configService.hasApp(a)).map((a: App) => ({
                        id: a,
                        title: AppInfo[a].title,
                    })),
                },
                {
                    name: 'method',
                    type: 'SELECT',
                    title: 'نوع درخواست',
                    options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((type) => ({ id: type, title: type })),
                    english: true,
                },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public logs: ILogResponseDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILogResponseDTO> = {
        type: 'کاربر',
        icon: (data) => AppInfo[data.app]?.icon || 'task_alt',
        columns: [
            { title: 'سرویس', value: (data) => AppInfo[data.app]?.title },
            { title: 'کاربر', value: (data) => data.user?.name },
            { title: 'تاریخ', value: 'date', type: 'DATE' },
            { title: '', value: 'date', type: 'DATE', format: 'H:I' },
            { title: 'درخواست', value: (data) => `${data.method}:${data.path}`, english: true },
            { title: 'زمان', value: (data) => `${data.duration.toString()}ms`, english: true },
        ],
    };

    constructor(private readonly apiService: ApiService, private readonly configService: ConfigService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const app: string = this.params?.params?.['app']?.param || '';
        const method: string = this.params?.params?.['method']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILogResponseRs>('LogResponse', { params: { app, method, page } }, (response) => {
            this.loading = false;
            this.logs = response.list;
            this.pagination = response.pagination;
        });
    }
}
