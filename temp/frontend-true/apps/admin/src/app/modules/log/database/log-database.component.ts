import { Component, OnInit } from '@angular/core';

import { ApiService, ILogDatabaseDTO, ILogDatabaseRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { App, AppInfo, AppList } from '@lib/shared';

interface ILogData {
    title: string;
    table: string;
    data: number;
    size: number;
}

interface ILog {
    title: string;
    count: number;
    size: number;
    data: ILogData[];
}

@Component({
    host: { selector: 'log-database' },
    templateUrl: './log-database.component.html',
    styleUrls: ['./log-database.component.scss'],
    standalone: false
})
export class LogDatabaseComponent implements OnInit {
    public title: IPageTitle = { title: 'گزارش بانک اطلاعاتی' };

    public activeTab: number = 0;
    public loading: boolean = true;
    public logs: ILog[] = [];

    public dbList: IList<ILogData> = {
        type: 'اطلاعات',
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'اطلاعات', value: 'data', type: 'NUMBER' },
            { title: 'حجم', value: 'size', type: 'FILE-SIZE' },
        ],
    };

    public serviceList: IList<ILogData> = {
        type: 'اطلاعات',
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'جدول', value: 'table', english: true, isDescription: true },
            { title: 'اطلاعات', value: 'data', type: 'NUMBER' },
            { title: 'حجم', value: 'size', type: 'FILE-SIZE' },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        const getApp = (logs: ILogDatabaseDTO[], app: App | null): { data: number; size: number } => ({
            data: logs.filter((log) => log.app === app).reduce((sum: number, l) => sum + l.data, 0),
            size: logs.filter((log) => log.app === app).reduce((sum: number, l) => sum + l.size, 0),
        });

        this.apiService.request<ILogDatabaseRs>('LogDatabase', (response) => {
            this.loading = false;
            this.logs = [
                {
                    title: 'بانک اطلاعاتی',
                    count: 0,
                    size: 0,
                    data: [
                        { title: 'سیستم', table: '', ...getApp(response, null) },
                        ...AppList.map((app: App) => ({ title: AppInfo[app].title, table: '', ...getApp(response, app) })),
                    ],
                },
            ];
            this.logs.push({ title: 'سیستم', count: 0, size: 0, data: response.filter((r) => r.app === null) });
            AppList.forEach((app: App) =>
                this.logs.push({
                    title: `سرویس: ${AppInfo[app].title}`,
                    count: 0,
                    size: 0,
                    data: response.filter((r) => r.app === app),
                }),
            );
            this.logs.forEach((log) => {
                log.count = log.data.reduce((sum: number, l) => sum + l.data, 0);
                log.size = log.data.reduce((sum: number, l) => sum + l.size, 0);
            });
            this.logs = this.logs.filter((log) => log.data.length !== 0);
        });
    }
}
