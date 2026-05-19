import { Injectable } from '@angular/core';

import { NgxHelperContainerService } from '@webilix/ngx-helper';

import {
    ApiService,
    ISupportNotificationDTO,
    ISupportNotificationUserListRs,
    ISupportNotificationUserViewRs,
} from '@lib/apis';
import { ConfigService, UserService } from '@lib/providers';
import { App } from '@lib/shared';

import { INotification } from './notification.interface';
import { NotificationComponent } from './notification.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    constructor(
        private readonly ngxHelperContainerService: NgxHelperContainerService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {}

    show(notification: INotification): Promise<INotification> {
        return new Promise<INotification>((resolve, reject) => {
            const viewContainerRef = this.ngxHelperContainerService.getContainer();
            if (!viewContainerRef) return reject();

            const component = viewContainerRef.createComponent(NotificationComponent);
            component.instance.notification = notification;

            component.instance.close = () => {
                component.destroy();
                resolve(notification);
            };
        });
    }

    private _app?: App;
    private _interval?: any;
    private _notifictions: ISupportNotificationDTO[] = [];

    private loadNotifications(): void {
        const user = this.userService.user;
        if (!user) {
            this._notifictions = [];
            return;
        }

        if (!this._app || this._notifictions.length !== 0) return;

        this.apiService.request<ISupportNotificationUserListRs>(
            'SupportNotificationUserList',
            { params: { app: this._app }, loading: false, silent: true },
            (response) => {
                this._notifictions = response;
                this.showNotifications();
            },
        );
    }

    private showNotifications(): void {
        if (this._notifictions.length === 0) return;

        const ID: string = this._notifictions[0].id;
        const notification: INotification = {
            icon: this._notifictions[0].icon,
            color: this._notifictions[0].color,
            title: this._notifictions[0].title,
            notification: this._notifictions[0].notification,
        };
        this.show(notification).then(
            () => {
                if (!this._app) return;

                this.apiService.request<ISupportNotificationUserViewRs>(
                    'SupportNotificationUserView',
                    { ids: { ID }, params: { app: this._app }, loading: false, silent: true },
                    () => {
                        this._notifictions.splice(0, 1);
                        this.showNotifications();
                    },
                    () => (this._notifictions = []),
                );
            },
            () => {},
        );
    }

    subscribe(app: App): void {
        this.unsubscribe();
        if (app === 'SUPPORT' || !this.configService.hasApp('SUPPORT')) return;
        if (!this.configService.hasApp(app)) return;

        this._app = app;
        this._notifictions = [];

        this._interval = setInterval(this.loadNotifications.bind(this), 10 * 60 * 1000);
        this.loadNotifications();
    }

    unsubscribe(): void {
        if (this._interval) clearInterval(this._interval);
        this._interval = undefined;

        this._app = undefined;
        this._notifictions = [];
    }
}
