import { Component, OnInit } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../providers';
import { IWarehouseCategory } from '../../app.interface';

import { HelpKeyComponent } from './key/help-key.component';
import { HelpTitleComponent } from './title/help-title.component';

interface IData {
    key: string;
    title: string;
}

@Component({
    host: { selector: 'help' },
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    standalone: false
})
export class HelpComponent implements OnInit {
    public warehouseQuestion = WarehouseQuestion;

    public title: IPageTitle = {
        title: 'راهنمای کد گروه‌ها',
        toolbar: {
            route: ['/help'],
            params: [
                {
                    name: 'indent',
                    type: 'SELECT',
                    title: 'سوال',
                    options: WarehouseQuestion.map((question, index: number) => ({
                        id: index.toString(),
                        title: question.title,
                    })),
                    value: '0',
                    required: true,
                },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [
            {
                type: 'MENU',
                icon: 'sort_by_alpha',
                title: 'ترتیب نمایش',
                action: (id: string) => this.setView(id as 'TITLE' | 'KEY'),
                menu: [
                    { id: 'KEY', title: 'کد گروه' },
                    { id: 'TITLE', title: 'عنوان گروه' },
                ],
            },
            {
                type: 'MENU',
                icon: 'download',
                title: 'دانلود',
                action: (id: string) => {
                    switch (id) {
                        case 'CODE':
                            this.ngxHelperBottomSheetService.open(HelpKeyComponent, 'دانلود لیست کد گروه‌ها', {
                                data: { indent: this.indent },
                            });
                            break;
                        case 'FULL':
                            this.ngxHelperBottomSheetService.open(HelpTitleComponent, 'دانلود لیست کامل گروه‌ها', {
                                data: { indent: this.indent },
                            });
                            break;
                    }
                },
                menu: [
                    { id: 'CODE', title: 'لیست کد گروه‌ها' },
                    { id: 'FULL', title: 'لیست کامل گروه‌ها' },
                ],
            },
        ],
    };

    public categories: IWarehouseCategory[] = this.warehouseToolsService.categories;

    public query: string = '';
    public indent: number = 0;

    public loading: boolean = true;
    public view: 'TITLE' | 'KEY' = 'KEY';

    public data: IData[] = [];
    public kList: IList<IData> = {
        type: 'گروه',
        columns: [
            { title: 'کد', value: 'key', isMono: true },
            { title: 'عنوان', value: 'title' },
        ],
    };
    public tList: IList<IData> = {
        type: 'گروه',
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'کد', value: 'key', isMono: true },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly warehouseToolsService: WarehouseToolsService,
    ) {}

    ngOnInit(): void {
        this.loadList({ params: {} } as INgxHelperParamValue);
    }

    loadList(value: INgxHelperParamValue): void {
        this.query = value.params['query']?.param || '';
        this.indent = +(value.params['indent']?.param || '0');
        if (isNaN(this.indent) || this.indent < 0 || this.indent > WarehouseQuestion.length - 1) this.indent = 0;

        this.setView(this.view);
    }

    setView(view: 'TITLE' | 'KEY'): void {
        this.loading = false;
        this.view = view;
        if (this.categories.length === 0) return;

        const categories: IWarehouseCategory[] = this.categories.filter(
            (c) => c.indent === this.indent && (this.query === '' || c.dto.title.indexOf(this.query) !== -1),
        );

        if (this.view === 'TITLE') this.setTitles(categories);
        else this.setKeys(categories);
    }

    setTitles(categories: IWarehouseCategory[]): void {
        const map: Map<string, Set<string>> = new Map<string, Set<string>>();
        categories.forEach((c) => {
            const title: string = c.dto.title;
            if (!map.get(title)) map.set(title, new Set<string>());
            map.get(title)?.add(c.dto.key);
        });

        let titles: { title: string; keys: string[] }[] = [];
        [...map.keys()].forEach((title: string) => {
            const set = map.get(title);
            const keys: string[] = set ? [...set.values()] : [];
            if (keys.length !== 0) titles.push({ title, keys });
        });

        titles = titles.sort((t1, t2) => t1.title.localeCompare(t2.title));
        titles.forEach((title) => (title.keys = title.keys.sort((k1, k2) => k1.localeCompare(k2))));
        this.data = titles.map((t) => ({ key: t.keys.join(' - '), title: t.title }));
    }

    setKeys(categories: IWarehouseCategory[]): void {
        const map: Map<string, Set<string>> = new Map<string, Set<string>>();
        categories.forEach((c) => {
            const key: string = c.dto.key;
            if (!map.get(key)) map.set(key, new Set<string>());
            map.get(key)?.add(c.dto.title);
        });

        let keys: { key: string; titles: string[] }[] = [];
        [...map.keys()].forEach((key: string) => {
            const set = map.get(key);
            const titles: string[] = set ? [...set.values()] : [];
            if (titles.length !== 0) keys.push({ key, titles });
        });

        keys = keys.sort((k1, k2) => k1.key.localeCompare(k2.key));
        keys.forEach((key) => (key.titles = key.titles.sort((t1, t2) => t1.localeCompare(t2))));
        this.data = keys.map((k) => ({ key: k.key, title: k.titles.join(' - ') }));
    }
}
