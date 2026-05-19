import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperMenu } from '@webilix/ngx-helper/menu';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILogVersionDTO, ILogVersionListRs, IOptionDTO, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    host: { selector: 'log-version' },
    templateUrl: './log-version.component.html',
    styleUrl: './log-version.component.scss',
    standalone: false
})
export class LogVersionComponent {
    public appList = AppList;
    public appInfo = AppInfo;

    public persons: IOptionDTO[] = this.activatedRoute.snapshot.data['persons'];

    public activeTab: number = 0;
    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش نسخه‌های سرویس‌ها',
        toolbar: {
            route: ['/log', 'version'],
            params: [
                {
                    name: 'app',
                    type: 'SELECT',
                    title: 'سرویس',
                    options: [
                        { id: 'ADMIN', title: 'مدیریت' },
                        ...AppList.map((app: App) => ({ id: app, title: AppInfo[app].title })),
                    ],
                },
                { name: 'user', type: 'SELECT', title: 'کاربر', options: this.persons },
            ],
        },
    };

    public appMenu: NgxHelperMenu[] = [
        ...AppList.map((app: App) => ({
            icon: AppInfo[app].icon,
            title: AppInfo[app].title,
            click: ['/log', 'version', app],
        })),
        'DIVIDER',
        { icon: 'admin_panel_settings', title: 'مدیریت', click: ['/log', 'version', 'ADMIN'] },
    ];

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public logs: ILogVersionDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILogVersionDTO> = {
        type: 'گزارش',
        icon: (data) => (data.app === 'ADMIN' ? 'admin_panel_settings' : AppInfo[data.app].icon),
        columns: [
            { title: 'سرویس', value: (data) => (data.app === 'ADMIN' ? 'مدیریت' : AppInfo[data.app].title) },
            { title: 'کاربر', value: (data) => data.user.name, isDescription: true },
            { title: 'نسخه سرویس', value: 'version', english: true },
            { title: 'نسخه انتشار', value: 'build', english: true },
            { title: 'تعداد استفاده', value: 'count', type: 'NUMBER' },
            { title: 'شروع استفاده', value: 'date', type: 'DATE' },
            { title: 'آخرین استفاده', value: 'lastUse', type: 'DATE' },
        ],
    };

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const app: string = this.params?.params?.['app']?.param || '';
        const user: string = this.params?.params?.['user']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILogVersionListRs>('LogVersionList', { params: { app, user, page } }, (response) => {
            this.loading = false;
            this.logs = response.list;
            this.pagination = response.pagination;
        });
    }
}
