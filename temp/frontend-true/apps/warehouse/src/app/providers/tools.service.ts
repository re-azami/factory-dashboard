import { Injectable } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiTypes, IWarehouseCategoryDTO } from '@lib/apis';

import { LogComponent } from '../components';
import { IWarehouseCategory, IWarehouseCategoryParent } from '../app.interface';

@Injectable({ providedIn: 'root' })
export class WarehouseToolsService {
    private _categories: IWarehouseCategory[] = [];
    get categories(): IWarehouseCategory[] {
        return this._categories;
    }

    constructor(private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService) {}

    initCategories(categories: IWarehouseCategoryDTO[]): IWarehouseCategory[] {
        categories = categories.sort((c1, c2) => c1.title.localeCompare(c2.title));

        const getSubs = (
            parent: string,
            indent: number,
            key: string,
            title: string,
            parents: IWarehouseCategoryParent[],
        ): IWarehouseCategory[] =>
            categories
                .filter((c) => c.parent === parent)
                .map((c) => ({
                    id: c.id,
                    dto: c,
                    indent,
                    fullKey: key + c.key,
                    fullTitle: title + ' > ' + c.title,
                    parents,
                    subs: getSubs(c.id, indent + 1, key + c.key, title + ' > ' + c.title, [
                        ...parents,
                        { id: c.id, title: c.title },
                    ]),
                }));

        const _categories: IWarehouseCategory[] = categories
            .filter((c) => !c.parent)
            .map((c) => ({
                id: c.id,
                dto: c,
                indent: 0,
                fullKey: c.key,
                fullTitle: c.title,
                parents: [],
                subs: getSubs(c.id, 1, c.key, c.title, [{ id: c.id, title: c.title }]),
            }));

        const addToList = (categories: IWarehouseCategory[]): void => {
            categories.forEach((c) => {
                this._categories.push(c);
                addToList(c.subs);
            });
        };
        this._categories = [];
        addToList(_categories);

        return this._categories;
    }

    getCategory(id: string): IWarehouseCategory | undefined {
        return this._categories.find((c) => c.id === id);
    }

    getCount(categories: IWarehouseCategory[]): number {
        let count: number = 0;
        categories.forEach((c) => (count += c.dto.items + this.getCount(c.subs)));
        return count;
    }

    showLog(title: string, api: ApiTypes, ids: { [key: string]: string }): void {
        this.ngxHelperBottomSheetService.open(LogComponent, title, { data: { api, ids } });
    }
}
