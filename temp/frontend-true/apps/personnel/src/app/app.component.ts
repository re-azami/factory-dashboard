import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { NotificationService } from '@lib/modules';
import { IPageMenu } from '@lib/page';
import { UserService } from '@lib/providers';
import { Access, AppInfo, PersonnelGroup, PersonnelGroupInfo, PersonnelGroupList } from '@lib/shared';

import { PersonnelSearchService } from './providers';

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
            id: 'MEMBER',
            icon: 'people',
            title: 'پرسنل',
            children: [
                {
                    title: 'ثبت پرسنل',
                    action: ['/member', 'create'],
                    access: { access: ['PERSONNEL_MEMBER', 'PERSONNEL_ROLE_MEMBER'] },
                },
                {
                    title: 'مدیریت پرسنل',
                    action: ['/member'],
                    access: { access: ['PERSONNEL_MEMBER', 'PERSONNEL_STATUS', 'PERSONNEL_ROLE_MEMBER'] },
                },
                'DIVIDER',
                {
                    title: 'جستجوی کد پرسنلی',
                    action: () => this.personnelSearchService.code(),
                    access: {
                        access: ['PERSONNEL_SEARCH', 'PERSONNEL_MEMBER', 'PERSONNEL_STATUS', 'PERSONNEL_ROLE_MEMBER'],
                    },
                },
                {
                    title: 'جستجوی پرسنلی',
                    action: () => this.personnelSearchService.personnel(),
                    access: {
                        access: ['PERSONNEL_SEARCH', 'PERSONNEL_MEMBER', 'PERSONNEL_STATUS', 'PERSONNEL_ROLE_MEMBER'],
                    },
                },
            ],
        },
        {
            id: 'LOCATION',
            icon: 'location_on',
            title: 'مکان',
            children: [{ title: 'مکان', action: ['/location'], access: { access: 'PERSONNEL_LOCATION' } }],
        },
        {
            id: 'REPORT',
            icon: 'assessment',
            title: 'گزارش',
            children: [
                {
                    title: 'گزارش',
                    action: ['/report', 'member'],
                    access: { access: ['PERSONNEL_REPORT_MEMBER', 'PERSONNEL_ROLE_MEMBER'] },
                },
            ],
        },
        {
            id: 'EXPORT',
            icon: 'file_download',
            title: 'دانلود',
            children: [
                { title: 'دانلود', action: ['/export'], access: { access: ['PERSONNEL_EXPORT', 'PERSONNEL_ROLE_MEMBER'] } },
            ],
        },
        {
            id: 'TOOLS',
            icon: 'workspaces',
            title: 'امکانات',
            children: [
                ...PersonnelGroupList.map((group: PersonnelGroup) => ({
                    title: `مدیریت ${PersonnelGroupInfo[group].title}`,
                    action: ['/group', group],
                    access: { access: 'PERSONNEL_GROUP' as Access },
                })),
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
        private readonly personnelSearchService: PersonnelSearchService,
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
        this.notificationService.subscribe('PERSONNEL');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'PERSONNEL' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['PERSONNEL'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }
}
