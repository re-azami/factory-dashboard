import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ISupportNotificationCreateRq, ISupportNotificationCreateRs } from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

import { notificationColors, notificationIcons } from '../notification.data';

@Component({
    host: { selector: 'notification-create' },
    templateUrl: './notification-create.component.html',
    styleUrl: './notification-create.component.scss',
    standalone: false
})
export class NotificationCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت اعلان جدید',
        inputs: [
            {
                name: 'apps',
                type: 'MULTI-SELECT',
                title: 'سرویس',
                options: AppList.filter((app: App) => this.configService.hasApp(app)).map((app: App) => ({
                    id: app,
                    title: AppInfo[app].title,
                })),
                view: 'SELECT',
                hint: 'در صورت عدم انتخاب سرویس، اعلان برای اعضای تمام سرویس‌ها ثبت خواهد شد.',
            },
            {
                inputs: [
                    { name: 'color', type: 'COLOR', title: 'رنگ', value: notificationColors[0], colors: notificationColors },
                    { name: 'icon', type: 'ICON', title: 'آیکون', value: notificationIcons[0], icons: notificationIcons },
                ],
                flex: [0.8],
            },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'notification', type: 'TEXTAREA', title: 'اعلان', maxHeight: 250, autoHeight: true },
            { name: 'expire', type: 'DATE', title: 'انقضا', minDate: new Date() },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ISupportNotificationCreateRq = {
            apps: values['apps'],
            color: values['color'],
            icon: values['icon'],
            title: values['title'],
            notification: values['notification'],
            expire: values['expire'],
        };
        this.apiService.request<ISupportNotificationCreateRs>('SupportNotificationCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
