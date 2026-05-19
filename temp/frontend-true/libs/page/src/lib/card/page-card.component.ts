import { Component, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import { DeviceService, IDeviceSize } from '@lib/providers';

import { IPageCardButton, IPageCardOption } from '../page.interface';

@Component({
    selector: 'page-card',
    templateUrl: './page-card.component.html',
    styleUrl: './page-card.component.scss',
    standalone: false
})
export class PageCardComponent implements OnInit, OnDestroy, OnChanges {
    @HostBinding('className') className: string = 'page-box-shadow';

    @Input({ required: true }) title!: string;
    @Input({ required: false }) icon?: string;
    @Input({ required: false }) description?: string;
    @Input({ required: false }) padding: string = '1rem';
    @Input({ required: false }) buttons: IPageCardButton[] = [];
    @Input({ required: false }) option?: IPageCardOption;

    @Input({ required: false }) menu: NgxHelperMenu[] = [];
    @Input({ required: false }) menuTitle?: string;
    @Input({ required: false }) menuIcon?: string;

    public optionIndex: number = 0;
    public optionMenu: NgxHelperMenu[] = [];
    public optionTitle: string = '';

    public size: IDeviceSize = this.deviceService.size;
    private onSizeChanged?: Subscription;

    constructor(private readonly deviceService: DeviceService) {}

    ngOnInit(): void {
        this.size = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe((size: IDeviceSize) => (this.size = size));

        this.optionIndex = 0;
        if (this.option && this.option.options.length > 1)
            this.optionIndex =
                this.option.index === undefined ? 0 : !!this.option.options[this.option.index] ? this.option.index : 0;

        this.setTitle();
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setOptions();
    }

    setTitle(): void {
        this.optionTitle = '';

        if (!this.option) return;

        const option = this.option.options[this.optionIndex];
        if (!option || option === 'DIVIDER') return;

        this.optionTitle = option.title;
    }

    setOptions(): void {
        this.optionMenu = [];
        if (!this.option || this.option.options.length <= 1) return;

        this.option.options.forEach((o, index) =>
            this.optionMenu.push(
                o === 'DIVIDER'
                    ? 'DIVIDER'
                    : {
                          title: o.title,
                          click: () => {
                              if (!this.option || !this.option.options[index] || this.option.options[index] === 'DIVIDER')
                                  return;

                              this.optionIndex = index;
                              this.option.action(this.option.options[index].id);
                              this.setTitle();
                          },
                          disableOn: () => this.optionIndex === index,
                      },
            ),
        );
    }
}
