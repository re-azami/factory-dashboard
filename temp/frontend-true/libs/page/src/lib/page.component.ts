import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subscription } from 'rxjs';

import { NgxHelperLoadingService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserAlertActiveRs, IUserAlertDTO, IUserDTO } from '@lib/apis';
import { DeviceService, IDeviceSize, UserService } from '@lib/providers';
import { Storages } from '@lib/shared';

import { IPageMenu, PageMenuChild } from './page.interface';

@Component({
    selector: 'page',
    templateUrl: './page.component.html',
    styleUrl: './page.component.scss',
    animations: [
        trigger('footer', [
            state('show', style({ opacity: 1, height: '*' })),
            state('hide', style({ opacity: 0, height: '0' })),
            transition('show <=> hide', animate('250ms ease-in')),
        ]),
        trigger('update', [
            state('show', style({ opacity: 1, bottom: '1rem' })),
            state('hide', style({ opacity: 0, bottom: '-35px' })),
            transition('show <=> hide', animate('150ms ease-in')),
        ]),
    ],
    standalone: false
})
export class PageComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.deviceService.setSize();
    }

    @Input({ required: true }) menu!: IPageMenu[];

    public id?: string;
    public pageMenu: IPageMenu[] = [];
    public offline: boolean = false;
    public updated: boolean = false;

    public alerts: IUserAlertDTO[] = [];
    public showAlerts: boolean = false;

    public size: IDeviceSize = this.deviceService.size;
    private onSizeChanged?: Subscription;

    public loading: boolean = false;
    private onLoadingChanged?: Subscription;

    public user?: IUserDTO;
    private onUserChanged?: Subscription;

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly router: Router,
        private readonly swUpdate: SwUpdate,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly ngxHelperLoadingService: NgxHelperLoadingService,
        private readonly apiService: ApiService,
        private readonly deviceService: DeviceService,
        private readonly userService: UserService,
    ) {
        window.addEventListener('online', () => {
            this.offline = false;
        });

        window.addEventListener('offline', () => {
            this.offline = true;
        });

        this.router.events.forEach((event) => {
            if (event instanceof NavigationError || event instanceof NavigationEnd || event instanceof NavigationCancel) {
                let data: any = null;
                let children = this.router.routerState.snapshot.root.children;
                const footers: string[] = [];

                while (children && children.length !== 0) {
                    data = children[0].data;
                    if (data?.['menu']) footers.push(data?.['menu']);
                    children = children[0].children;
                }

                this.id = footers.length > 0 ? footers[footers.length - 1] : undefined;
            }
        });
    }

    ngOnInit(): void {
        if (this.swUpdate.isEnabled)
            this.swUpdate.versionUpdates.subscribe((update: VersionEvent) => {
                if (!update || !update.type || update.type !== 'VERSION_READY') return;
                this.swUpdate.activateUpdate().then(() => (this.updated = true));
            });

        this.size = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe((size: IDeviceSize) => (this.size = size));

        this.loading = this.ngxHelperLoadingService.loading;
        this.onLoadingChanged = this.ngxHelperLoadingService.onLoadingChanged.subscribe({
            next: (loading: boolean) => {
                if (this.loading === loading) return;

                this.loading = loading;
                this.changeDetectorRef.detectChanges();
            },
        });

        this.user = this.userService.user;
        this.onUserChanged = this.userService.onUserChanged.subscribe({
            next: (user?: IUserDTO) => {
                this.user = user;
                this.checkAlert();
                this.setPageMenu();
            },
        });

        this.setPageMenu();
        setTimeout(this.checkAlert.bind(this), 250);
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
        this.onLoadingChanged?.unsubscribe();
        this.onUserChanged?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setPageMenu();
    }

    ngAfterViewInit(): void {
        if (localStorage.getItem(Storages.APP_UPDATE) !== 'TRUE') return;

        setTimeout(() => {
            localStorage.removeItem(Storages.APP_UPDATE);
            this.ngxHelperToastService.info('اپلیکیشن با موفقیت به‌روزرسانی شد.', 0);
        }, 0);
    }

    checkAlert(): void {
        this.alerts = [];
        if (!this.user) return;

        this.apiService.request<IUserAlertActiveRs>(
            'UserAlertActive',
            { silent: true, loading: false },
            (response) => (this.alerts = response),
        );
    }

    setPageMenu(): void {
        this.pageMenu = [];
        if (!this.user) return;

        this.menu.forEach((menu: IPageMenu) => {
            const pageMenu: IPageMenu = { ...menu, children: [] };

            // Check access
            menu.children.forEach((child: PageMenuChild) => {
                if (child !== 'DIVIDER' && child.access && !this.userService.hasAccess(child.access)) return;

                pageMenu.children.push(child);
            });

            // Remove consecutive 'DIVIDER'
            pageMenu.children.forEach((child, index: number) => {
                if (child === 'DIVIDER' && pageMenu.children[index - 1] === 'DIVIDER') pageMenu.children.splice(index, 1);
            });

            // Remove 'DIVIDER' from beginnig
            while (pageMenu.children[0] === 'DIVIDER') pageMenu.children.splice(0, 1);

            // Remove 'DIVIDER' at end
            while (pageMenu.children[pageMenu.children.length - 1] === 'DIVIDER')
                pageMenu.children.splice(pageMenu.children.length - 1);

            if (pageMenu.children.length > 0) this.pageMenu.push(pageMenu);
        });
    }

    update(): void {
        localStorage.setItem(Storages.APP_UPDATE, 'TRUE');
        sessionStorage.setItem(Storages.APP_UPDATE, 'TRUE');
        document.location.reload();
    }
}
