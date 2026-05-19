import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { IPaginationDTO } from '@lib/apis';
import { DeviceService, IDeviceSize } from '@lib/providers';

import { IList } from './list.interface';

@Component({
    selector: 'list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    standalone: false
})
export class ListComponent<T> implements OnInit, OnDestroy, OnChanges {
    @Input({ required: true }) list!: IList<T>;
    @Input({ required: true }) loading!: boolean;
    @Input({ required: true }) data!: T[];
    @Input({ required: false }) pagination: IPaginationDTO | null = null;

    @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

    public size: IDeviceSize = this.deviceService.size;
    private onSizeChanged?: Subscription;

    constructor(private readonly deviceService: DeviceService) {}

    ngOnInit(): void {
        this.size = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe((size: IDeviceSize) => (this.size = size));
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Set default titles
        this.list.columns.forEach((c) => {
            let title: string | undefined = undefined;

            if (!c.title)
                switch (c.type) {
                    case 'FILE-SIZE':
                        title = 'حجم فایل';
                        break;
                    case 'MOBILE':
                        title = 'موبایل';
                        break;
                    case 'NATIONAL-CODE':
                        title = 'کدملی';
                        break;
                    case 'PLATE':
                        title = 'پلاک';
                        break;
                }

            if (title) Object.assign(c, { title });
        });
    }
}
