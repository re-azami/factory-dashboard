import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { NotificationService } from '@lib/modules';
import { IPageMenu } from '@lib/page';
import { UserService } from '@lib/providers';
import { AppInfo } from '@lib/shared';

import { KitchenInventoryService, KitchenToolsService } from './providers';

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
            id: 'WAREHOUSE',
            icon: 'warehouse',
            title: 'انبار',
            children: [
                { title: 'گروه‌های کالا', action: ['/group'], access: { access: 'KITCHEN_GROUP' } },
                { title: 'مدیریت کالاها', action: ['/good'], access: { access: ['KITCHEN_GOOD', 'KITCHEN_INVENTORY'] } },
                'DIVIDER',
                {
                    title: 'ورود کالا به انبار',
                    action: () => this.kitchenInventoryService.inventoryCreate('ENTER'),
                    access: { access: 'KITCHEN_INVENTORY' },
                },
                {
                    title: 'خروج کالا از انبار',
                    action: () => this.kitchenInventoryService.inventoryCreate('EXIT'),
                    access: { access: 'KITCHEN_INVENTORY' },
                },
                {
                    title: 'تغییر موجودی کالا',
                    action: () => this.kitchenInventoryService.inventoryCreate('RESET'),
                    access: { access: 'KITCHEN_INVENTORY' },
                },
            ],
        },
        {
            id: 'RESTAURANT',
            icon: 'dining',
            title: 'رستوران',
            children: [
                { title: 'مدیریت غذاها', action: ['/recipe'], access: { access: 'KITCHEN_RECIPE' } },
                {
                    title: 'برنامه غذایی',
                    action: ['/calendar'],
                    access: { access: ['KITCHEN_CALENDAR', 'KITCHEN_SERVING'] },
                },
            ],
        },
        {
            id: 'SCAN',
            icon: 'qr_code',
            title: 'اسکن بارکد',
            children: [
                {
                    title: 'اسکن بارکد',
                    action: () => this.kitchenToolsService.scanBarcode(),
                    access: { access: 'KITCHEN_SERVING' },
                },
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
        private readonly kitchenInventoryService: KitchenInventoryService,
        private readonly kitchenToolsService: KitchenToolsService,
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
        this.notificationService.subscribe('KITCHEN');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'KITCHEN' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['KITCHEN'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }
}
