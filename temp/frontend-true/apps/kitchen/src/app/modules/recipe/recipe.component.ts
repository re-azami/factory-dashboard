import { Component } from '@angular/core';

import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IKitchenRecipeDeleteRs,
    IKitchenRecipeDTO,
    IKitchenRecipeListRs,
    IKitchenRecipeStatusRq,
    IKitchenRecipeStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { KitchenGoodInfo, KitchenMealInfo, KitchenMealList } from '@lib/shared';

@Component({
    host: { selector: 'recipe' },
    standalone: false,
    templateUrl: './recipe.component.html',
    styleUrl: './recipe.component.scss',
})
export class RecipeComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت غذاها',
        toolbar: {
            route: ['/recipe'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    icon: 'task_alt',
                    options: [
                        { title: 'فعال', value: 'ACTIVE', icon: 'check_circle' },
                        { title: 'غیرفعال', value: 'DEACTIVE', icon: 'cancel' },
                    ],
                },
                {
                    name: 'meal',
                    type: 'SELECT',
                    title: 'وعده غذایی',
                    options: KitchenMealList.map((m) => ({ id: m, title: KitchenMealInfo[m].title })),
                },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [{ type: 'CREATE', title: 'غذای جدید', action: ['/recipe', 'create'] }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public recipes: IKitchenRecipeDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IKitchenRecipeDTO> = {
        type: 'کالا',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        description: (data) => data.description,
        columns: [
            { title: 'عنوان', value: 'title' },
            {
                title: 'وعده غذایی',
                value: (data) => data.meals.map((m) => KitchenMealInfo[m].title).join('، '),
                isDescription: true,
            },
            {
                title: KitchenGoodInfo.INGREDIENT.title,
                value: (data) =>
                    data.goods
                        .filter((g) => g.good === 'INGREDIENT')
                        .map((g) => g.title)
                        .join('، '),
            },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { type: 'UPDATE', action: (data) => ['/recipe', 'update', data.id] },
            {
                type: 'STATUS',
                action: this.status.bind(this),
                isActive: (data) => data.status === 'ACTIVE',
            },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const status: string = this.params?.params?.['status']?.param || '';
        const meal: string = this.params?.params?.['meal']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IKitchenRecipeListRs>(
            'KitchenRecipeList',
            { params: { status, meal, query, page } },
            (response) => {
                this.loading = false;
                this.recipes = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    delete(recipe: IKitchenRecipeDTO): void {
        const item: string = 'غذا';
        const title: string = recipe.title;
        const message: string =
            'در صورت تایید، اطلاعات سرو غذا در سیستم باقی خواهد ماند و فقط مشخصات غذا حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = recipe.id;
            this.apiService.request<IKitchenRecipeDeleteRs>('KitchenRecipeDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('غذا با موفقیت حذف شد.');
            });
        });
    }

    status(recipe: IKitchenRecipeDTO, active: boolean): void {
        const item: string = 'غذا';
        const title: string = recipe.title;
        const message: string = active
            ? 'پس از فعال کردن غذا، امکان ثبت سرو غذا فعال می‌شود.'
            : 'در صورت تایید، اطلاعات غذا در سیستم باقی خواهد ماند اما امکان ثبت سرو غذا غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = recipe.id;
            const body: IKitchenRecipeStatusRq = { active };
            this.apiService.request<IKitchenRecipeStatusRs>('KitchenRecipeStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`غذا با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }
}
