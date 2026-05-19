import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { DeviceService, IDeviceSize, UserService } from '@lib/providers';

import { IPageTitle, IPageTitleAction, IPageTitleActionMenu } from '../page.interface';

@Component({
    selector: 'page-title',
    templateUrl: './page-title.component.html',
    styleUrl: './page-title.component.scss',
    standalone: false
})
export class PageTitleComponent implements OnInit, OnDestroy, OnChanges {
    @Input({ required: false }) page?: number;
    @Input({ required: true }) title!: IPageTitle;

    @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() paramChanged: EventEmitter<INgxHelperParamValue> = new EventEmitter<INgxHelperParamValue>();
    @Output() calendarChanged: EventEmitter<INgxHelperCalendarValue> = new EventEmitter<INgxHelperCalendarValue>();

    public size: IDeviceSize = this.deviceService.size;
    private onSizeChanged?: Subscription;

    public actions: (IPageTitleAction | IPageTitleActionMenu)[] = [];
    public toolbarSize: { paramsWidth?: number; calendarWidth?: number; height: number } = { height: 36 };

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly router: Router,
        private readonly deviceService: DeviceService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.size = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe((size: IDeviceSize) => {
            this.size = size;
            this.setSizes();
        });

        this.setSizes();
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.actions = [];

        (this.title.actions || []).forEach((action) => {
            if (action.access && !this.userService.hasAccess(action.access)) return;
            if (action.hideOn && action.hideOn()) return;

            switch (action.type) {
                case undefined:
                case 'ACTION':
                    this.actions.push({ ...action, type: 'ACTION' });
                    return;
                case 'CREATE':
                    this.actions.push({ ...action, type: 'ACTION', icon: 'add', color: 'primary' });
                    break;
                case 'DELETE':
                    this.actions.push({ ...action, type: 'ACTION', icon: 'delete', color: 'warn' });
                    break;
                case 'RETURN':
                    this.actions.push({ ...action, type: 'ACTION', title: 'بازگشت', icon: 'chevron_right' });
                    return;
                case 'MENU':
                    this.actions.push(action);
                    return;
            }
        });
    }

    setSizes(): void {
        let toolbarHeight: number = 0;

        if (this.title.toolbar) {
            this.toolbarSize = { height: this.size.isMobile ? 32 : 36 };
            if (this.size.isMobile) {
                const hasParam: boolean = !!this.title.toolbar.params && this.title.toolbar.params.length > 0;
                const hasCalendar: boolean = !!this.title.toolbar.calendar;

                if (hasParam) toolbarHeight += 32;
                if (hasCalendar) toolbarHeight += 32;
                toolbarHeight += hasParam && hasCalendar ? 32 : hasParam || hasCalendar ? 16 : 0;
            } else {
                this.toolbarSize.paramsWidth = 150;
                this.toolbarSize.calendarWidth = 350;
            }
        }

        document.documentElement.style.setProperty(
            '--pageTitleHeight',
            `${(this.size.isMobile ? 60 : 70) + toolbarHeight}px`,
        );
    }

    setPage(page: number): void {
        this.pageChange.emit(page);
        this.changeDetectorRef.detectChanges();
    }

    click(action: string[] | (() => void)): void {
        if (typeof action === 'function') action();
        else this.router.navigate(action);
    }

    private paramValue?: INgxHelperParamValue;
    emitParamChanged(value: INgxHelperParamValue): void {
        if (JSON.stringify(value) === JSON.stringify(this.paramValue || {})) return;

        this.paramValue = value;
        this.paramChanged.emit(this.paramValue);
    }

    private calendarValue?: INgxHelperCalendarValue;
    emitCalendarChanged(values: INgxHelperCalendarValue): void {
        if (JSON.stringify(values) === JSON.stringify(this.calendarValue || {})) return;

        this.calendarValue = values;
        this.calendarChanged.emit(this.calendarValue);
    }
}
