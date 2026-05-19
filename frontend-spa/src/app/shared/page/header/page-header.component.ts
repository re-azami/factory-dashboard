import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperDialogService } from '@webilix/ngx-helper';

import { PageAboutComponent } from '../about/page-about.component';
import { IDeviceSize } from '../../interfaces/device-size';
import { IPageMenu, PageMenuChild } from '../../interfaces/page-menu';
import { AppService, ColorMode } from '../../services/app.service';

@Component({
    selector: 'app-page-header',
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
    ],
    standalone: false,
})
export class PageHeaderComponent implements OnInit, OnDestroy {
    @Input({ required: true }) id?: string;
    @Input({ required: true }) menu!: IPageMenu[];
    @Input({ required: true }) size!: IDeviceSize;
    @Input({ required: true }) loading!: boolean;

    public applicationTitle: string = 'داشبورد کارخانه';
    public openedMenu?: number;
    public colorMode: ColorMode = 'LIGHT';

    private onColorModeChanged?: Subscription;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperDialogService: NgxHelperDialogService,
        public readonly appService: AppService,
    ) {}

    ngOnInit(): void {
        this.colorMode = this.appService.colorMode;
        this.onColorModeChanged = this.appService.onColorModeChanged.subscribe(
            (mode: ColorMode) => (this.colorMode = mode),
        );
    }

    ngOnDestroy(): void {
        this.onColorModeChanged?.unsubscribe();
    }

    click(menu: PageMenuChild): void {
        if (menu === 'DIVIDER') return;

        if (typeof menu.action === 'function') menu.action();
        else this.router.navigate(menu.action);
    }

    about(): void {
        this.ngxHelperDialogService.open(PageAboutComponent, 'درباره نرم‌افزار', { padding: '0px' });
    }

    toggleColorMode(): void {
        this.appService.toggleColorMode();
    }
}
