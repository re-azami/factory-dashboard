import { Component, OnInit } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, IPaginationDTO, IWarehouseStockDTO, IWarehouseStockDeleteRs, IWarehouseStockListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { SettingService } from '@lib/providers';
import { Storages, WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../providers';
import { IWarehouseCategory } from '../../app.interface';

import { StockTitleComponent } from './title/stock-title.component';

@Component({
    host: { selector: 'stock' },
    templateUrl: './stock.component.html',
    styleUrls: ['./stock.component.scss'],
    standalone: false
})
export class StockComponent implements OnInit {
    public categories: IWarehouseCategory[] = this.warehouseToolsService.categories;

    public page: number = 1;
    public title: IPageTitle = { title: 'مدیریت کالاها' };

    public filter: string[] = [];
    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public stocks: IWarehouseStockDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public dash: boolean = this.settingService.warehouse.dash;
    public list: IList<IWarehouseStockDTO> = {
        type: 'کالا',
        columns: [
            {
                title: 'کد کالا',
                value: (data) => this.getCategory(data.category)?.fullKey + (this.dash ? '-' : '') + data.code,
                copy: (data) => this.getCategory(data.category)?.fullKey + data.code,
                english: true,
                isMono: true,
                isDescription: true,
            },
            { title: 'کالا', value: 'title', isTitle: true },
            ...WarehouseQuestion.map((q, index) => ({
                title: q.title,
                value: (data: IWarehouseStockDTO) =>
                    (this.getCategory(data.category)?.parents || [])[index]?.title ||
                    this.getCategory(data.category)?.dto.title ||
                    '',
            })),
        ],
        actions: [
            {
                title: 'ویرایش عنوان',
                icon: 'text_fields',
                action: this.update.bind(this),
                access: { access: 'WAREHOUSE_STOCK' },
            },
            { type: 'DELETE', action: this.delete.bind(this), access: { access: 'WAREHOUSE_DELETE' } },
            'DIVIDER',
            { type: 'LOG', action: this.log.bind(this), access: { access: 'WAREHOUSE_STOCK_LOG' } },
        ],
    };

    private getCategory = this.warehouseToolsService.getCategory.bind(this.warehouseToolsService);

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly warehouseToolsService: WarehouseToolsService,
        private readonly settingService: SettingService,
    ) {}

    ngOnInit(): void {
        if (this.categories.length !== 0) {
            const search = localStorage.getItem(Storages.WAREHOUSE_SEARCH) || '';

            this.title = {
                ...this.title,
                toolbar: {
                    route: ['/stock'],
                    params: [
                        { name: 'query', type: 'SEARCH' },
                        {
                            name: 'search',
                            type: 'SELECT',
                            title: 'نوع جستجو',
                            value: ['AND', 'OR', 'FULL'].includes(search) ? search : 'AND',
                            options: [
                                { id: 'AND', title: 'همه کلمه‌ها' },
                                { id: 'OR', title: 'هر کدام از کلمه‌ها' },
                                { id: 'FULL', title: 'عبارت کامل' },
                            ],
                            required: true,
                        },
                    ],
                },
                actions: [{ type: 'CREATE', title: 'ثبت کالا', action: ['/stock', 'create'] }],
            };
        }
    }

    setFilter(filter: string[]): void {
        this.filter = filter;
        this.loadList();
    }

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const category: string = this.filter.join('|');
        const query: string = this.params?.params?.['query']?.param || '';
        const search: string = this.params?.params?.['search']?.param || 'AND';
        const page: string = this.params?.page?.toString() || '1';

        localStorage.setItem(Storages.WAREHOUSE_SEARCH, search);
        this.apiService.request<IWarehouseStockListRs>(
            'WarehouseStockList',
            { params: { category, search, query, page } },
            (response) => {
                this.stocks = response.list;
                this.pagination = response.pagination;
                this.loading = false;
            },
        );
    }

    update(stock: IWarehouseStockDTO): void {
        this.ngxHelperBottomSheetService.open(StockTitleComponent, 'ویرایش عنوان کالا', { data: { stock } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('عنوان کالا با موفقیت ویرایش شد.');
        });
    }

    delete(stock: IWarehouseStockDTO): void {
        const item: string = 'کالا';
        const title: string = stock.title;

        this.ngxHelperConfirmService.delete(item, { title }, () => {
            const ID: string = stock.id;
            this.apiService.request<IWarehouseStockDeleteRs>('WarehouseStockDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('کالا با موفقیت حذف شد.');
            });
        });
    }

    log(stock: IWarehouseStockDTO): void {
        this.warehouseToolsService.showLog('گزارش تغییرات کالا', 'WarehouseStockLog', { ID: stock.id });
    }
}
