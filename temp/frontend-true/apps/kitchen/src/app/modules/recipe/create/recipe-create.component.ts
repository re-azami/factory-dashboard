import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IKitchenRecipeCreateRq, IKitchenRecipeCreateRs, IKitchenRecipeGoodDTO } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { KitchenGoodInfo, KitchenMeal, KitchenMealInfo, KitchenMealList } from '@lib/shared';

@Component({
    host: { selector: 'recipe-create' },
    standalone: false,
    templateUrl: './recipe-create.component.html',
    styleUrl: './recipe-create.component.scss',
})
export class RecipeCreateComponent {
    public title: IPageTitle = {
        title: 'مدیریت غذاها',
        description: 'ثبت غذای جدید',
        actions: [{ type: 'RETURN', action: ['/recipe'] }],
    };

    public ingredientGoods: IKitchenRecipeGoodDTO[] = [];
    public additiveGoods: IKitchenRecipeGoodDTO[] = [];
    public consumableGoods: IKitchenRecipeGoodDTO[] = [];
    public ngxForm: INgxForm = {
        submit: 'ثبت غذای جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            {
                name: 'meals',
                type: 'MULTI-SELECT',
                title: 'وعده غذایی',
                options: KitchenMealList.map((meal: KitchenMeal) => ({
                    id: meal,
                    title: KitchenMealInfo[meal].title,
                })),
                minCount: 1,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/recipe']) }],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        if (this.ingredientGoods.length === 0) {
            this.ngxHelperToastService.error(`${KitchenGoodInfo.INGREDIENT.title} انتخاب نشده است.`);
            return;
        }

        const body: IKitchenRecipeCreateRq = {
            title: values['title'],
            meals: values['meals'],
            description: values['description'],
            goods: [...this.ingredientGoods, ...this.additiveGoods, ...this.consumableGoods].map((good) => ({
                id: good.id,
                servingUnit: good.serving?.unit || null,
                servingValue: good.serving?.value || null,
                servingDescription: good.serving?.description || null,
            })),
        };
        this.apiService.request<IKitchenRecipeCreateRs>('KitchenRecipeCreate', { body }, () => {
            this.ngxHelperToastService.success('غذای جدید با موفقیت ثبت شد.');
            this.router.navigate(['/recipe']);
        });
    }
}
