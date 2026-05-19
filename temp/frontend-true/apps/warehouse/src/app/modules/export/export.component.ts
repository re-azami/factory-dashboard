import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Helper } from '@webilix/helper-library';
import { NgxHelperHttpService } from '@webilix/ngx-helper';

import {
    ApiService,
    IWarehouseExportCategoryRq,
    IWarehouseExportCategoryRs,
    IWarehouseExportStockRq,
    IWarehouseExportStockRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList, WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../providers';
import { IWarehouseCategory } from '../../app.interface';

@Component({
    host: { selector: 'export' },
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
    standalone: false
})
export class ExportComponent implements OnInit {
    public warehouseQuestion = WarehouseQuestion;

    public title: IPageTitle = { title: 'دانلود لیست کالاها' };

    public categories: IWarehouseCategory[] = this.warehouseToolsService.categories;
    public total: number = this.categories.reduce((sum: number, c) => sum + c.dto.items, 0);

    public parent: string | null = null;
    public parents: IWarehouseCategory[] = [];
    public items: IWarehouseCategory[] = [];
    public list: IList<IWarehouseCategory> = {
        type: 'گروه',
        columns: [
            { title: 'کد', value: 'fullKey', isDescription: true, isMono: true },
            {
                title: 'گروه',
                value: (data) => data.dto.title,
                action: (data) => (data.parents.length >= WarehouseQuestion.length - 1 ? [] : ['/export', data.id]),
                isTitle: true,
            },
            { title: 'کالا', value: (data) => this.warehouseToolsService.getCount([data]), type: 'NUMBER' },
        ],
        actions: ExportTypeList.map((type: ExportType) => ({
            title: ExportTypeInfo[type].title,
            icon: ExportTypeInfo[type].icon,
            action: (data: IWarehouseCategory) => this.exportCategory(type, data.id),
        })),
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly warehouseToolsService: WarehouseToolsService,
    ) {}

    ngOnInit(): void {
        if (this.total !== 0) {
            this.title = {
                ...this.title,
                description: `${Helper.NUMBER.format(this.total)} کالا`,
                actions: ExportTypeList.map((type: ExportType) => ({
                    title: ExportTypeInfo[type].title,
                    icon: ExportTypeInfo[type].icon,
                    action: () => this.exportStock(type),
                })),
            };
        }

        this.activatedRoute.params.subscribe({
            next: (params: Params) => this.setParent(params?.['ID'] || null),
        });

        this.setParent(null);
    }

    getCategoryRoute(parent: IWarehouseCategory): string[] {
        return ['/export', parent.dto.parent || ''];
    }

    setParent(parent: string | null): void {
        this.parents = [];
        if (this.categories.length === 0) return;

        let category = parent ? this.categories.find((c) => c.id === parent) : null;
        if (parent && !category) parent = null;

        while (category) {
            this.parents.unshift(category);
            category = this.categories.find((c) => c.id === category?.dto.parent);
        }

        this.items = this.categories.filter((c) => c.dto.parent === parent);
    }

    exportStock(type: ExportType): void {
        const body: IWarehouseExportStockRq = { type };
        this.apiService.request<IWarehouseExportStockRs>('WarehouseExportStock', { body }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }

    exportCategory(type: ExportType, category: string): void {
        const body: IWarehouseExportCategoryRq = { type, category };
        this.apiService.request<IWarehouseExportCategoryRs>('WarehouseExportCategory', { body }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }
}
