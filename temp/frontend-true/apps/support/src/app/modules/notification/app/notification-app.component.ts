import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ISupportNotificationAppRq, ISupportNotificationAppRs, ISupportNotificationDTO } from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    host: { selector: 'notification-app' },
    templateUrl: './notification-app.component.html',
    styleUrl: './notification-app.component.scss',
    standalone: false
})
export class NotificationAppComponent {
    public ngxForm: INgxForm = {
        submit: 'تغییر سرویس‌های اعلان',
        inputs: [
            {
                name: 'apps',
                type: 'MULTI-SELECT',
                title: 'سرویس',
                value: this.data.notification.apps,
                options: AppList.filter((app: App) => this.configService.hasApp(app)).map((app: App) => ({
                    id: app,
                    title: AppInfo[app].title,
                })),
                hint: 'در صورت عدم انتخاب سرویس، اعلان برای اعضای تمام سرویس‌ها ثبت خواهد شد.',
            },
            {
                name: 'reset',
                type: 'CHECKBOX',
                message: 'ریست کردن وضعیت مشاهده اعلان',
                description:
                    'در صورت تایید این گزینه، وضعیت مشاهده اعلان برای تمام کاربران مرتبط به صورت مشاهده نشده تغییر داده می‌‌شود. ' +
                    'در این حالت، اعلان پس از ویرایش مجددا به تمام کاربران مرتبط نمایش داده خواهد شد.',
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { notification: ISupportNotificationDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.notification.id;
        const body: ISupportNotificationAppRq = {
            apps: values['apps'],
            reset: values['reset'],
        };
        this.apiService.request<ISupportNotificationAppRs>('SupportNotificationApp', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
