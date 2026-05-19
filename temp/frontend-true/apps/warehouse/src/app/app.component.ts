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
            id: 'CATEGORY',
            icon: 'account_tree',
            title: 'گروه',
            children: [{ title: 'گروه', action: ['/category'], access: { access: 'WAREHOUSE_CATEGORY' } }],
        },
        {
            id: 'STOCK',
            icon: 'inventory_2',
            title: 'کالا',
            children: [{ title: 'کالا', action: ['/stock'], access: { access: ['WAREHOUSE_STOCK', 'WAREHOUSE_DELETE'] } }],
        },
        {
            id: 'SEARCH',
            icon: 'search',
            title: 'جستجو',
            children: [
                { title: 'جستجو', action: ['/search'], access: { access: ['WAREHOUSE_STOCK', 'WAREHOUSE_INVENTORY'] } },
            ],
        },
        {
            id: 'TOOLS',
            icon: 'workspaces',
            title: 'امکانات',
            children: [
                { title: 'دانلود لیست کالاها', action: ['/export'], access: { access: 'WAREHOUSE_EXPORT' } },
                { title: 'راهنمای کد گروه‌ها', action: ['/help'], access: { access: 'WAREHOUSE_HELP' } },
                'DIVIDER',
                {
                    title: 'تنظیمات سیستم',
                    action: () => this.ngxHelperBottomSheetService.open(SettingComponent, 'تنظیمات'),
                    access: { access: 'WAREHOUSE_SETTING' },
                },
            ],
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
        this.notificationService.subscribe('WAREHOUSE');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'WAREHOUSE' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['WAREHOUSE'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }
}
