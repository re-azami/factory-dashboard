import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { NotificationService } from '@lib/modules';
import { IPageMenu } from '@lib/page';
import { UserService } from '@lib/providers';
import { AppInfo } from '@lib/shared';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false,
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
            id: 'PRODUCTION',
            icon: 'factory',
            title: 'تولید',
            children: [
                {
                    title: 'سنگ شکن',
                    action: ['/production', 'crusher'],
                    access: { access: 'LABORATORY_PRODUCTION_CRUSHER' },
                },
                {
                    title: 'ختکا',
                    action: ['/production', 'khatka'],
                    access: { access: 'LABORATORY_PRODUCTION_KHATKA' },
                },
            ],
        },
        {
            id: 'TEST',
            icon: 'biotech',
            title: 'نتایج',
            children: [
                {
                    title: 'مشاهده نتایج روزانه',
                    action: ['/daily'],
                    access: {
                        access: [
                            'LABORATORY_CRUSHER',
                            'LABORATORY_KHATKA',
                            'LABORATORY_BLAINE',
                            'LABORATORY_DAVIS',
                            'LABORATORY_SOLID',
                            'LABORATORY_LOAD',
                            'LABORATORY_ROLE_LOAD',
                            'LABORATORY_ROLE_TECHNICIAN',
                        ],
                    },
                },
                'DIVIDER',
                { title: 'آزمایش سنگ شکن', action: ['/crusher'], access: { access: 'LABORATORY_ROLE_TECHNICIAN' } },
                { title: 'آزمایش ختکا', action: ['/khatka'], access: { access: 'LABORATORY_ROLE_TECHNICIAN' } },
                'DIVIDER',
                { title: 'آزمایش بلین', action: ['/blaine'], access: { access: 'LABORATORY_ROLE_TECHNICIAN' } },
                { title: 'آزمایش دیویس تیوب', action: ['/davis'], access: { access: 'LABORATORY_ROLE_TECHNICIAN' } },
                { title: 'آزمایش درصد جامد', action: ['/solid'], access: { access: 'LABORATORY_ROLE_TECHNICIAN' } },
                'DIVIDER',
                { title: 'آزمایش بارهای روزانه', action: ['/load'], access: { access: 'LABORATORY_ROLE_LOAD' } },
                {
                    title: 'آزمایش بارهای متفرقه',
                    action: ['/misc'],
                    access: { access: ['LABORATORY_MISC', 'LABORATORY_ROLE_MISC'] },
                },
                {
                    title: 'آزمایش بارهای متفرقه',
                    action: ['/supplementary'],
                    access: { access: ['LABORATORY_SUPPLEMENTARY', 'LABORATORY_ROLE_SUPPLEMENTARY'] },
                },
            ],
        },
        {
            id: 'REPORT',
            icon: 'assessment',
            title: 'گزارش',
            children: [
                {
                    title: 'گزارش متوسط نتایج آزمایش',
                    action: ['/report', 'average'],
                    access: { access: 'LABORATORY_REPORT_AVERAGE' },
                },
                'DIVIDER',
                {
                    title: 'گزارش جامع سنگ شکن',
                    action: ['/report', 'crusher', 'location'],
                    access: { access: ['LABORATORY_REPORT_CRUSHER_LOCATION', 'LABORATORY_ROLE_TECHNICIAN'] },
                },
                {
                    title: 'گزارش جامع ختکا',
                    action: ['/report', 'khatka', 'location'],
                    access: { access: ['LABORATORY_REPORT_KHATKA_LOCATION', 'LABORATORY_ROLE_TECHNICIAN'] },
                },
                'DIVIDER',
                {
                    title: 'گزارش بارهای سنگ شکن',
                    action: ['/report', 'crusher'],
                    access: { access: ['LABORATORY_REPORT_CRUSHER', 'LABORATORY_ROLE_TECHNICIAN'] },
                },
                {
                    title: 'گزارش بارهای ختکا',
                    action: ['/report', 'khatka'],
                    access: { access: ['LABORATORY_REPORT_KHATKA', 'LABORATORY_ROLE_TECHNICIAN'] },
                },
                {
                    title: 'گزارش بارهای روزانه',
                    action: ['/report', 'load'],
                    access: { access: ['LABORATORY_REPORT_LOAD', 'LABORATORY_ROLE_LOAD'] },
                },
            ],
        },
        {
            id: 'TOOLS',
            icon: 'workspaces',
            title: 'امکانات',
            children: [
                { title: 'مدیریت بارها', action: ['/cargo'], access: { access: 'LABORATORY_CARGO' } },
                'DIVIDER',
                { title: 'تنظیمات سیستم', action: ['/setting'], access: { access: 'LABORATORY_SETTING' } },
            ],
        },
    ];

    public user?: IUserDTO;
    private onUserChanged?: Subscription;

    constructor(
        private readonly router: Router,
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
        this.notificationService.subscribe('LABORATORY');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'LABORATORY' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['LABORATORY'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }
}
