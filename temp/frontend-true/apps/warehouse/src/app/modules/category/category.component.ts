import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperListMenu } from '@webilix/ngx-helper/list';

import { ApiService, IWarehouseCategoryDeleteRs, IWarehouseCategoryListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../providers';
import { IWarehouseCategory } from '../../app.interface';

import { CategoryCreateComponent } from './create/category-create.component';
import { CategoryUpdateComponent } from './update/category-update.component';

@Component({
    host: { selector: 'category' },
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    standalone: false
})
export class CategoryComponent implements OnInit {
    public warehouseQuestion = WarehouseQuestion;

    public loading: boolean = true;
    public categories: IWarehouseCategory[] = [];

    public title: IPageTitle = {
        title: 'مدیریت گروه‌ها',
        actions: [{ type: 'CREATE', title: 'ثبت گروه جدید', action: this.create.bind(this) }],
    };

    public parents: IWarehouseCategory[] = [];
    public items: IWarehouseCategory[] = [];
    public list: IList<IWarehouseCategory> = {
        type: 'گروه',
        columns: [
            { title: 'کد', value: 'fullKey', isDescription: true, isMono: true },
            {
                title: 'گروه',
                value: (data) => data.dto.title,
                action: (data) => (data.parents.length >= WarehouseQuestion.length - 1 ? [] : ['/category', data.id]),
                isTitle: true,
            },
            { title: 'کالا', value: (data) => this.warehouseToolsService.getCount([data]), type: 'NUMBER' },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            {
                type: 'DELETE',
                action: this.delete.bind(this),
                hideOn: (data) => data.dto.items !== 0 || data.subs.length !== 0,
            },
            'DIVIDER',
            { type: 'LOG', action: this.log.bind(this), access: { access: 'WAREHOUSE_CATEGORY_LOG' } },
        ],
    };

    public menu: NgxHelperListMenu<IWarehouseCategory>[] = ['DIVIDER'];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly warehouseToolsService: WarehouseToolsService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params.subscribe({
            next: (params: Params) => this.setCategory(params?.['ID'] || null),
        });

        this.loadList();
    }

    loadList(): void {
        this.apiService.request<IWarehouseCategoryListRs>('WarehouseCategoryList', (response) => {
            this.loading = false;
            this.categories = this.warehouseToolsService.initCategories(response);

            this.setCategory(this.activatedRoute.snapshot.params?.['ID'] || null);
        });
    }

    getCategoryRoute(parent: IWarehouseCategory): string[] {
        return ['/category', parent.dto.parent || ''];
    }

    setCategory(parent: string | null): void {
        this.parents = [];
        if (this.categories.length === 0) return;

        let category = this.categories.find((c) => c.id === parent);
        if (parent && !category) {
            this.router.navigate(['/category']);
            return;
        }

        while (category) {
            this.parents.unshift(category);
            category = this.categories.find((c) => c.id === category?.dto.parent);
        }

        this.items = this.categories.filter((c) => c.dto.parent === parent);
    }

    create(): void {
        const parent: IWarehouseCategory | undefined =
            this.parents.length === 0 ? undefined : this.parents[this.parents.length - 1];
        if (!WarehouseQuestion[parent ? parent.indent + 1 : 0]) {
            this.ngxHelperToastService.error(
                `امکان ثبت زیر گروه برای "${WarehouseQuestion[parent ? parent.indent : 0].title}" وجود ندارد.`,
            );
            return;
        }

        this.ngxHelperBottomSheetService.open(CategoryCreateComponent, 'ثبت گروه جدید', { data: { parent } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('گروه با موفقیت ثبت شد.');
        });
    }

    update(category: IWarehouseCategory): void {
        this.ngxHelperBottomSheetService.open(CategoryUpdateComponent, 'ویرایش گروه', { data: { category } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('گروه با موفقیت ویرایش شد.');
        });
    }

    delete(category: IWarehouseCategory): void {
        const item: string = 'گروه';
        const title: string = category.fullTitle;

        this.ngxHelperConfirmService.delete(item, { title }, () => {
            const ID: string = category.id;
            this.apiService.request<IWarehouseCategoryDeleteRs>('WarehouseCategoryDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه با موفقیت حذف شد.');
            });
        });
    }

    log(category: IWarehouseCategory): void {
        this.warehouseToolsService.showLog('گزارش تغییرات گروه', 'WarehouseCategoryLog', { ID: category.id });
    }
}
