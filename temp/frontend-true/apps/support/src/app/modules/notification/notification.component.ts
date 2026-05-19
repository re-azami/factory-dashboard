import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IPaginationDTO,
    ISupportNotificationDTO,
    ISupportNotificationDeleteRs,
    ISupportNotificationListRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { NotificationService } from '@lib/modules';
import { IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

import { NotificationCreateComponent } from './create/notification-create.component';
import { NotificationUpdateComponent } from './update/notification-update.component';
import { NotificationAppComponent } from './app/notification-app.component';
import { NotificationUserComponent } from './user/notification-user.component';

@Component({
    host: { selector: 'notification' },
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss',
    standalone: false
})
export class NotificationComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'اعلان‌های عمومی',
        toolbar: {
            route: ['/notification'],
            params: [
                {
                    name: 'app',
                    type: 'SELECT',
                    title: 'سرویس',
                    options: AppList.filter((app: App) => app !== 'SUPPORT')
                        .filter((app: App) => this.configService.hasApp(app))
                        .map((app: App) => ({ id: app, title: AppInfo[app].title })),
                },
            ],
        },
        actions: [{ type: 'CREATE', title: 'ثبت اعلان', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public notifications: ISupportNotificationDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public now: number = new Date().getTime();
    public list: IList<ISupportNotificationDTO> = {
        type: 'اعلان',
        icon: (data) => data.icon,
        columns: [
            { title: 'عنوان', value: 'title', color: (data) => data.color, description: (data) => this.getApps(data.apps) },
            {
                title: 'انقضا',
                value: 'expire',
                type: 'DATE',
                color: (data) => (this.now > data.expire.getTime() ? 'var(--warnColor)' : ''),
            },
            { title: 'کاربر', value: (data) => data.users.length, type: 'NUMBER' },
            { title: 'مشاهده', value: (data) => data.users.filter((u) => !!u.view).length, type: 'NUMBER' },
        ],
        actions: [
            { icon: 'chat', title: 'پیش‌نمایش', action: this.preview.bind(this) },
            { icon: 'people', title: 'کاربرها', action: this.user.bind(this) },
            'DIVIDER',
            {
                icon: 'workspaces',
                title: 'تغییر سرویس‌ها',
                action: this.app.bind(this),
                hideOn: (data) => this.now > data.expire.getTime(),
            },
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly notificationService: NotificationService,
    ) {}

    getApps(apps: App[]): string {
        const list: App[] = AppList.filter((app: App) => this.configService.hasApp(app) && apps.includes(app));
        if (list.length === 0) return 'همه سرویس‌ها';

        return list.map((app: App) => AppInfo[app].title).join('، ');
    }

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const app: string = this.params?.params?.['app']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ISupportNotificationListRs>(
            'SupportNotificationList',
            { params: { app, page } },
            (response) => {
                this.loading = false;
                this.notifications = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(NotificationCreateComponent, 'ثبت اعلان جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('اعلان با موفقیت ثبت شد.');
        });
    }

    preview(notification: ISupportNotificationDTO): void {
        this.notificationService
            .show({
                icon: notification.icon,
                color: notification.color,
                title: notification.title,
                notification: notification.notification,
            })
            .then(
                () => {},
                () => {},
            );
    }

    user(notification: ISupportNotificationDTO): void {
        this.ngxHelperBottomSheetService.open(NotificationUserComponent, 'کاربرهای مرتبط با اعلان', {
            data: { notification },
        });
    }

    app(notification: ISupportNotificationDTO): void {
        this.ngxHelperBottomSheetService.open(
            NotificationAppComponent,
            'تغییر سرویس‌های اعلان',
            { data: { notification } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('سرویس‌های اعلان با موفقیت ثبت شد.');
            },
        );
    }

    update(notification: ISupportNotificationDTO): void {
        this.ngxHelperBottomSheetService.open(
            NotificationUpdateComponent,
            'ویرایش اعلان',
            { data: { notification } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('اعلان با موفقیت ویرایش شد.');
            },
        );
    }

    delete(notification: ISupportNotificationDTO): void {
        const item: string = 'اعلان';
        const title: string = notification.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = notification.id;
            this.apiService.request<ISupportNotificationDeleteRs>('SupportNotificationDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('اعلان با موفقیت حذف شد.');
            });
        });
    }
}
