import { ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subscription } from 'rxjs';

import { AppService } from '../services/app.service';
import { LoadingService } from '../services/loading.service';
import { IDeviceSize } from '../interfaces/device-size';
import { IPageMenu } from '../interfaces/page-menu';

@Component({
    selector: 'app-page',
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
    standalone: false,
})
export class PageComponent implements OnInit, OnDestroy {
    @HostListener('window:resize')
    onResize(): void {
        this.appService.setDeviceSize();
    }

    @Input({ required: true }) menu!: IPageMenu[];

    public id?: string;
    public offline: boolean = false;
    public updated: boolean = false;

    public size: IDeviceSize = this.appService.deviceSize;
    private onSizeChanged?: Subscription;

    public loading: boolean = false;
    private onLoadingChanged?: Subscription;

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly router: Router,
        private readonly swUpdate: SwUpdate,
        private readonly appService: AppService,
        private readonly loadingService: LoadingService,
    ) {
        window.addEventListener('online', () => (this.offline = false));
        window.addEventListener('offline', () => (this.offline = true));

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
        if (this.swUpdate.isEnabled) {
            this.swUpdate.versionUpdates.subscribe((update: VersionEvent) => {
                if (!update || !update.type || update.type !== 'VERSION_READY') return;
                this.swUpdate.activateUpdate().then(() => (this.updated = true));
            });
        }

        this.size = this.appService.deviceSize;
        this.onSizeChanged = this.appService.onDeviceSizeChanged.subscribe((size: IDeviceSize) => (this.size = size));

        this.loading = this.loadingService.loading;
        this.onLoadingChanged = this.loadingService.onLoadingChanged.subscribe({
            next: (loading: boolean) => {
                if (this.loading === loading) return;

                this.loading = loading;
                this.changeDetectorRef.detectChanges();
            },
        });
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
        this.onLoadingChanged?.unsubscribe();
    }

    update(): void {
        document.location.reload();
    }
}
