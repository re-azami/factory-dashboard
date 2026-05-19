import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { IList } from '../list.interface';
import { IListSetting, ListService } from '../list.service';

@Component({
    selector: 'list-grid',
    templateUrl: './list-grid.component.html',
    styleUrl: './list-grid.component.scss',
    standalone: false
})
export class ListGridComponent<T> implements OnChanges {
    @Input({ required: true }) list!: IList<T>;
    @Input({ required: true }) data!: T[];

    public setting!: IListSetting;
    public getMenu = (list: IList<T>, item: T) => this.listService.getMenu(list, item);

    public mouseOver?: number;
    public openedMenu?: number;

    constructor(private readonly router: Router, private readonly listService: ListService) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.setting = this.listService.getListSetting<T>(this.list, this.data);
    }

    click(data: T, action: (data: T) => string[] | void): void {
        const result = action(data);
        if (Array.isArray(result) && result.length > 0) this.router.navigate(result);
    }
}
