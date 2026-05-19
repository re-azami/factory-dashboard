import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { NotificationService } from '@lib/modules';
import { IPageMenu } from '@lib/page';
import { UserService } from '@lib/providers';
import { AppInfo } from '@lib/shared';

import { TransportToolsService } from './providers';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
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
            id: 'STATION',
            icon: 'group_work',
            title: 'ایستگاه',
            children: [{ title: 'ایستگاه', action: ['/station'], access: { access: 'TRANSPORT_ROLE_STATION' } }],
        },
        {
            id: 'ROUTE',
            icon: 'route',
            title: 'مسیر',
            children: [
                { title: 'مدیریت مسیرها', action: ['/route'], access: { access: 'TRANSPORT_ROLE_ROUTE' } },
                { title: 'مسیرهای نهایی', action: ['/final'], access: { access: 'TRANSPORT_FINAL' } },
            ],
        },
        {
            id: 'TOOLS',
            icon: 'workspaces',
            title: 'امکانات',
            children: [
                { title: 'مدیریت گروه‌ها', action: ['/group'], access: { access: 'TRANSPORT_GROUP' } },
                {
                    title: 'مدیریت مکان‌ها',
                    action: this.selectLocationGroup.bind(this),
                    access: { access: 'TRANSPORT_LOCATION' },
                },
                { title: 'مدیریت پارکینگ‌ها', action: ['/parking'], access: { access: 'TRANSPORT_PARKING' } },
                'DIVIDER',
                { title: 'آپلود لیست مکان‌ها', action: ['/import'], access: { access: 'TRANSPORT_IMPORT' } },
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
        private readonly transportToolsService: TransportToolsService,
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
        this.notificationService.subscribe('TRANSPORT');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'TRANSPORT' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['TRANSPORT'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }

    selectLocationGroup(): void {
        this.transportToolsService.selectGroup((group) => this.router.navigate(['/location', group.id]));
    }
}
