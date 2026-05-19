import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ISupportNotificationDTO, ISupportNotificationUpdateRq, ISupportNotificationUpdateRs } from '@lib/apis';

import { notificationColors, notificationIcons } from '../notification.data';

@Component({
    host: { selector: 'notification-update' },
    templateUrl: './notification-update.component.html',
    styleUrl: './notification-update.component.scss',
    standalone: false
})
export class NotificationUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش اعلان',
        inputs: [
            {
                inputs: [
                    {
                        name: 'color',
                        type: 'COLOR',
                        title: 'رنگ',
                        value: this.data.notification.color,
                        colors: notificationColors,
                    },
                    {
                        name: 'icon',
                        type: 'ICON',
                        title: 'آیکون',
                        value: this.data.notification.icon,
                        icons: notificationIcons,
                    },
                ],
                flex: [0.8],
            },
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.notification.title },
            {
                name: 'notification',
                type: 'TEXTAREA',
                title: 'اعلان',
                value: this.data.notification.notification,
                maxHeight: 250,
                autoHeight: true,
            },
            {
                name: 'expire',
                type: 'DATE',
                title: 'انقضا',
                value:
                    new Date().getTime() > this.data.notification.expire.getTime()
                        ? undefined
                        : this.data.notification.expire,
                minDate: new Date(),
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
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.notification.id;
        const body: ISupportNotificationUpdateRq = {
            color: values['color'],
            icon: values['icon'],
            title: values['title'],
            notification: values['notification'],
            expire: values['expire'],
            reset: values['reset'],
        };
        this.apiService.request<ISupportNotificationUpdateRs>('SupportNotificationUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
