import { Component, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { DeviceService, IDeviceSize } from '@lib/providers';

@Component({
    selector: 'page-section-column',
    templateUrl: './page-section-column.component.html',
    styleUrl: './page-section-column.component.scss',
    standalone: false
})
export class PageSectionColumnComponent implements OnInit, OnDestroy, OnChanges {
    @HostBinding('style.flex') flexSize: string = '1';
    @HostBinding('style.width') widthSize: string = '*';
    @HostBinding('className') className: string = '';

    @Input({ required: false }) flex?: number;
    @Input({ required: false }) width?: number;
    @Input({ required: false }) sticky?: boolean;

    public size: IDeviceSize = this.deviceService.size;
    private onSizeChanged?: Subscription;

    constructor(private readonly deviceService: DeviceService) {}

    ngOnInit(): void {
        this.size = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe((size: IDeviceSize) => {
            this.size = size;
            this.className = !this.size.isMobile && this.sticky === true ? 'page-sticky' : '';
        });
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.flexSize = this.width ? 'unset' : this.flex?.toString() || '1';
        this.widthSize = this.width ? `${this.width}px` : '*';
        this.className = !this.size.isMobile && this.sticky === true ? 'page-sticky' : '';
    }
}
