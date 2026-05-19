import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperBottomSheetService, NgxHelperDialogService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { ConfigService, IDeviceSize, UserService, VersionService } from '@lib/providers';
import { Access, AccessInfo, App, AppInfo, AppList, Storages, UserGroupInfo } from '@lib/shared';

import { PageAboutComponent } from '../about/page-about.component';
import { PageUserUpdateComponent } from '../user/update/page-user-update.component';
import { PageUserPasswordComponent } from '../user/password/page-user-password.component';

import { IPageMenu, PageMenuChild } from '../page.interface';

@Component({
    selector: 'page-header',
    templateUrl: './page-header.component.html',
    styleUrl: './page-header.component.scss',
    animations: [
        trigger('menu', [
            state('show', style({ opacity: 1, height: '*' })),
            state('hide', style({ opacity: 0, height: 0 })),
            transition('show <=> hide', animate('250ms ease-in')),
        ]),
        trigger('icon', [
            state('show', style({ opacity: 1, transform: 'scale(1)' })),
            state('hide', style({ opacity: 0, transform: 'scale(0)' })),
            transition('show <=> hide', animate('250ms ease-in')),
        ]),
        trigger('signout', [
            state('show', style({ height: '*' })),
            state('hide', style({ height: 0 })),
            transition('show <=> hide', animate('100ms ease-in')),
        ]),
    ],
    standalone: false
})
export class PageHeaderComponent implements OnInit, OnDestroy, OnChanges {
    @Input({ required: true }) id?: string;
    @Input({ required: true }) menu!: IPageMenu[];
    @Input({ required: true }) size!: IDeviceSize;
    @Input({ required: true }) loading!: boolean;
    @Input({ required: true }) user?: IUserDTO;

    @Input({ required: true }) hasAlert: boolean = false;
    @Input({ required: true }) showAlerts: boolean = false;
    @Output() showAlertsChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    public userGroupInfo = UserGroupInfo;

    public app: 'ADMIN' | App | undefined = this.versionService.app;
    public appTitle: string = this.app === 'ADMIN' ? 'مدیریت' : this.app ? AppInfo[this.app].title : '';
    public appMenu: NgxHelperMenu[] = [];
    public hasSupport = this.configService.hasApp('SUPPORT') && this.app !== 'SUPPORT';

    public applicationTitle: string = this.configService.applicationTitle;
    public openedMenu?: number;

    public signoutShow: boolean = false;
    public signoutTimer: number = 5;
    public signoutInterval: any;

    public updated: boolean = false;
    private onVersionChanged?: Subscription;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperDialogService: NgxHelperDialogService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly versionService: VersionService,
    ) {}

    ngOnInit(): void {
        this.updated = this.versionService.isUpdated();
        this.onVersionChanged = this.versionService.onVersionChanged.subscribe({
            next: (updated: boolean) => (this.updated = updated),
        });
    }

    ngOnDestroy(): void {
        this.onVersionChanged?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setApps();
    }

    setApps(): void {
        this.appMenu = [];
        if (!this.user) return;

        const apps: App[] = [];
        if (this.user.group === 'MANAGER') apps.push(...AppList);
        else {
            if (this.user.group === 'ADMIN') apps.push(...this.user.admin);
            this.user.access.forEach((a: Access) => apps.push(AccessInfo[a].app));
        }

        this.appMenu = apps
            .filter((a: App, index: number, arr: App[]) => arr.indexOf(a) === index)
            .filter((a: App) => this.configService.hasApp(a))
            .sort((a1, a2) => AppInfo[a1].title.localeCompare(AppInfo[a2].title))
            .map((a: App) => ({
                title: AppInfo[a].title,
                icon: AppInfo[a].icon,
                click: () => this.changeApp(a),
                disableOn: () => this.versionService.app === a,
            }));
    }

    changeApp(app: App): void {
        if (!this.user) return;

        const url: string = `https://${AppInfo[app].subdomain}.${this.configService.domain}/`;
        const path: string = `?token=${encodeURIComponent(localStorage.getItem(Storages.USER_TOKEN) || '')}`;
        document.location = `${url}${path}`;
    }

    click(menu: PageMenuChild): void {
        if (menu === 'DIVIDER') return;

        if (typeof menu.action === 'function') menu.action();
        else this.router.navigate(menu.action);
    }

    update(): void {
        if (!this.user) return;
        this.ngxHelperBottomSheetService.open(PageUserUpdateComponent, 'ویرایش مشخصات عضویت', {
            data: { user: this.user },
        });
    }

    password(): void {
        if (!this.user) return;
        this.ngxHelperBottomSheetService.open(PageUserPasswordComponent, 'تغییر کلمه عبور');
    }

    about(): void {
        this.ngxHelperDialogService.open(PageAboutComponent, 'درباره نرم‌افزار', { padding: '0px' });
    }

    signout(): void {
        if (!this.user) return;
        if (this.signoutInterval) window.clearInterval(this.signoutInterval);

        if (!this.signoutShow) {
            this.signoutShow = true;
            this.signoutTimer = 5;
            this.signoutInterval = setInterval(() => {
                this.signoutTimer--;
                if (this.signoutTimer > 0) return;

                this.signoutShow = false;
                window.clearInterval(this.signoutInterval);
            }, 1000);

            return;
        }

        this.apiService.request<IUserSignoutRs>('UserSignout', () => {
            this.signoutShow = false;
            this.userService.signout();
            this.router.navigate(['/']);
        });
    }

    toggleShowAlert(): void {
        this.showAlerts = !this.showAlerts;
        this.showAlertsChange.emit(this.showAlerts);
    }
}
