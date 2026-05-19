import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { IPageMenu } from '@lib/page';
import { ConfigService, UserService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
    public menu: IPageMenu[] = [
        // {
        //     id: 'DASHBOARD',
        //     icon: 'home',
        //     title: 'داشبورد',
        //     children: [{ title: 'داشبورد', action: ['/dashboard'] }],
        // },

        { id: 'PERSON', icon: 'people', title: 'کاربر', children: [{ title: 'کاربر', action: ['/person'] }] },
        {
            id: 'ADMIN',
            icon: 'engineering',
            title: 'مدیر',
            children: [{ title: 'مدیر', action: ['/admin'], access: { group: 'MANAGER' } }],
        },
        {
            id: 'LOG',
            icon: 'assessment',
            title: 'گزارش',
            children: [
                { title: 'بانک اطلاعاتی', action: ['/log', 'database'], access: { group: 'MANAGER' } },
                { title: 'اس‌ام‌اس', action: ['/log', 'sms'], access: { group: 'MANAGER' } },
                { title: 'نسخه‌های سرویس‌ها', action: ['/log', 'version'], access: { group: 'MANAGER' } },
                { title: 'کانتینرهای داکر', action: ['/log', 'container'], access: { group: 'MANAGER' } },
                'DIVIDER',
                { title: 'گزارش ماهانه', action: ['/log', 'monthly'], access: { group: 'MANAGER' } },
                { title: 'گزارش پاسخ‌ها', action: ['/log', 'response'], access: { group: 'MANAGER' } },
                { title: 'گزارش اشکالات', action: ['/log', 'exception'], access: { group: 'MANAGER' } },
            ],
        },
        {
            id: 'SERVICE',
            icon: 'workspaces',
            title: 'سرویس',
            children: AppList.filter((app: App) => this.configervice.hasApp(app)).map((app: App) => ({
                title: `گزارش سرویس ${AppInfo[app].title}`,
                action: ['/service', app],
                access: { group: 'MANAGER' },
            })),
        },
        {
            id: 'TOOLS',
            icon: 'miscellaneous_services',
            title: 'ابزار',
            children: [
                { title: 'مغایرت بارهای آزمایشگاه', action: ['/tools', 'laboratory-load'], access: { group: 'MANAGER' } },
            ],
        },
    ];

    public user?: IUserDTO;
    private onUserChanged?: Subscription;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configervice: ConfigService,
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
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ group: ['MANAGER', 'ADMIN'] })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = 'دسترسی‌ای برای سرویس مدیریت برای شما ایجاد نشده است.';
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }
}
