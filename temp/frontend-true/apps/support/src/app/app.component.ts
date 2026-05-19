import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { NotificationService } from '@lib/modules';
import { IPageMenu } from '@lib/page';
import { UserService } from '@lib/providers';
import { AppInfo } from '@lib/shared';

import { SettingComponent } from './components';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
    public menu: IPageMenu[] = [
        {
            id: 'DASHBOARD',
            icon: 'home',
            title: 'داشبورد',
            children: [{ title: 'داشبورد', action: ['/dashboard'] }],
        },
        {
            id: 'TICKET',
            icon: 'support_agent',
            title: 'درخواست',
            children: [{ title: 'درخواست', action: ['/ticket'], access: { access: 'SUPPORT_TICKET' } }],
        },
        {
            id: 'NOTIFICATION',
            title: 'اعلان',
            icon: 'notifications_active',
            children: [
                { title: 'اعلان‌های عمومی', action: ['/notification'], access: { access: 'SUPPORT_NOTIFICATION' } },
                { title: 'اعلان‌های سیستمی', action: ['/alert'], access: { access: 'SUPPORT_ALERT' } },
            ],
        },
        {
            id: 'SETTING',
            title: 'تنظیمات',
            icon: 'settings',
            children: [{ title: 'تنظیمات', action: this.setting.bind(this), access: { access: 'SUPPORT_SETTING' } }],
        },
    ];

    public user?: IUserDTO;
    private onUserChanged?: Subscription;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.user = this.userService.user;
        this.onUserChanged = this.userService.onUserChanged.subscribe({
            next: (user?: IUserDTO) => {
                this.user = user;
                this.checkUserAccess();
            },
        });

        setTimeout(this.checkUserAccess.bind(this), 0);
        this.notificationService.subscribe('SUPPORT');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'SUPPORT' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['SUPPORT'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }

    setting(): void {
        this.ngxHelperBottomSheetService.open(SettingComponent, 'تنظیمات');
    }
}
