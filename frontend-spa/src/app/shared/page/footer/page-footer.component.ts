import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { IPageMenu, PageMenuChild } from '../../interfaces/page-menu';

@Component({
    selector: 'app-page-footer',
    templateUrl: './page-footer.component.html',
    styleUrl: './page-footer.component.scss',
    standalone: false,
})
export class PageFooterComponent {
    @Input({ required: true }) id?: string;
    @Input({ required: true }) menu!: IPageMenu[];

    public openedMenu?: number;

    constructor(private readonly router: Router) {}

    click(menu: PageMenuChild): void {
        if (menu === 'DIVIDER') return;

        if (typeof menu.action === 'function') menu.action();
        else this.router.navigate(menu.action);
    }
}
