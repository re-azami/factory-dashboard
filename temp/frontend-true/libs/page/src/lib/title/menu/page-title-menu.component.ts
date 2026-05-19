import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { IDeviceSize, UserService } from '@lib/providers';

import { IPageTitleActionMenu } from '../../page.interface';

@Component({
    selector: 'page-title-menu',
    templateUrl: './page-title-menu.component.html',
    styleUrl: './page-title-menu.component.scss',
    standalone: false,
})
export class PageTitleMenuComponent implements OnChanges {
    @HostBinding('style.display') protected display: string = '';

    @Input({ required: true }) action!: IPageTitleActionMenu;
    @Input({ required: true }) size!: IDeviceSize;

    public menuItems: (
        | 'DIVIDER'
        | {
              readonly id: string;
              readonly title: string;
              readonly description?: string;
              readonly isDeactive: boolean;
          }
    )[] = [];

    constructor(private readonly router: Router, private readonly userService: UserService) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.menuItems = this.action.menu
            .filter((m) => m === 'DIVIDER' || !m.access || this.userService.hasAccess(m.access))
            .map((m) =>
                m === 'DIVIDER'
                    ? 'DIVIDER'
                    : { id: m.id, title: m.title, description: m.description, isDeactive: !!m.deactiveOn && m.deactiveOn() },
            );

        // Remove consecutive 'DIVIDER'
        this.menuItems.forEach((m, index: number) => {
            if (m === 'DIVIDER' && m[index - 1] === 'DIVIDER') this.menuItems.splice(index, 1);
        });

        // Remove 'DIVIDER' from beginnig
        while (this.menuItems[0] === 'DIVIDER') this.menuItems.splice(0, 1);

        // Remove 'DIVIDER' at end
        while (this.menuItems[this.menuItems.length - 1] === 'DIVIDER') this.menuItems.splice(this.menuItems.length - 1);

        if (this.menuItems.length === 0) this.display = 'none';
    }

    click(id: string): void {
        const click = this.action.action(id);
        if (click) this.router.navigate(click);
    }
}
