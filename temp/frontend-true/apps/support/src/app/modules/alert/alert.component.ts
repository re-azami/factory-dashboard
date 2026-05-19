import { Component } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, IAlertDTO, IPaginationDTO, IUserAlertListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { ConfigService, SettingService } from '@lib/providers';
import { Alert, AlertInfo, AlertList, App, AppInfo, AppList, IAlert } from '@lib/shared';

import { AlertRecipientComponent } from './recipient/alert-recipient.component';

interface IAlertData {
    alert: string;
    info: IAlert;
}

@Component({
    host: { selector: 'alert' },
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.scss',
    standalone: false
})
export class AlertComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'اعلان‌های سیستمی',
        toolbar: {
            route: ['/alert'],
            params: [
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع اعلان',
                    options: AlertList.map((alert: Alert) => ({
                        id: alert,
                        title: AppInfo[AlertInfo[alert].app].title + ' :: ' + AlertInfo[alert].title,
                    })),
                },
                {
                    name: 'app',
                    type: 'SELECT',
                    title: 'سرویس',
                    options: AppList.filter((app: App) => app !== 'SUPPORT')
                        .filter((app: App) => this.configService.hasApp(app))
                        .filter((app: App) => AlertList.some((alert: Alert) => AlertInfo[alert].app === app))
                        .map((app: App) => ({ id: app, title: AppInfo[app].title })),
                },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public alerts: IAlertDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IAlertDTO> = {
        type: 'اعلان',
        icon: (data) => ({
            icon: AppInfo[AlertInfo[data.type].app].icon,
            color: new Date().getTime() - data.date.getTime() > this.alertTimeout ? 'warn' : 'primary',
        }),
        description: (data) => data.alert,
        columns: [
            { title: 'سیستم', value: (data) => AppInfo[AlertInfo[data.type].app].title, isDescription: true },
            { title: 'عنوان', value: (data) => AlertInfo[data.type].title, isTitle: true },
            { title: 'تاریخ', value: 'date', type: 'DATE' },
            { title: 'ساعت', value: 'date', type: 'DATE', format: 'H:I' },
            { title: 'دریافت کننده', value: (data) => data.recipients.length, type: 'NUMBER' },
            { title: 'مشاهده', value: (data) => data.recipients.filter((r) => r.view !== null).length, type: 'NUMBER' },
        ],
        actions: [{ icon: 'group', title: 'دریافت کننده‌ها', action: this.recipients.bind(this) }],
    };

    private alertTimeout: number = this.settingService.alertTimeout * 3600 * 1000;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly settingService: SettingService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const type: string = this.params?.params?.['type']?.param || '';
        const app: string = this.params?.params?.['app']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IUserAlertListRs>('UserAlertList', { params: { type, app, page } }, (response) => {
            this.loading = false;
            this.alerts = response.list;
            this.pagination = response.pagination;
        });
    }

    recipients(alert: IAlertDTO): void {
        this.ngxHelperBottomSheetService.open(AlertRecipientComponent, 'لیست دریافت کننده‌ها', { data: { alert } });
    }
}
