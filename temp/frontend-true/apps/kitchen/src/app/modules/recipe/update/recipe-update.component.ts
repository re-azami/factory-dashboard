import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IKitchenRecipeDTO,
    IKitchenRecipeGoodDTO,
    IKitchenRecipeUpdateRq,
    IKitchenRecipeUpdateRs,
} from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { KitchenGoodInfo, KitchenMeal, KitchenMealInfo, KitchenMealList } from '@lib/shared';

@Component({
    host: { selector: 'recipe-update' },
    standalone: false,
    templateUrl: './recipe-update.component.html',
    styleUrl: './recipe-update.component.scss',
})
export class RecipeUpdateComponent {
    public recipe: IKitchenRecipeDTO = this.activatedRoute.snapshot.data['recipe'];

    public title: IPageTitle = {
        title: 'مدیریت غذاها',
        description: 'ویرایش غذا',
        actions: [{ type: 'RETURN', action: ['/recipe'] }],
    };

    public ingredientGoods: IKitchenRecipeGoodDTO[] = this.recipe.goods.filter((g) => g.good === 'INGREDIENT');
    public additiveGoods: IKitchenRecipeGoodDTO[] = this.recipe.goods.filter((g) => g.good === 'ADDITIVE');
    public consumableGoods: IKitchenRecipeGoodDTO[] = this.recipe.goods.filter((g) => g.good === 'CONSUMABLE');
    public ngxForm: INgxForm = {
        submit: 'ویرایش غذا',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.recipe.title },
            {
                name: 'meals',
                type: 'MULTI-SELECT',
                title: 'وعده غذایی',
                value: this.recipe.meals,
                options: KitchenMealList.map((meal: KitchenMeal) => ({
                    id: meal,
                    title: KitchenMealInfo[meal].title,
                })),
                minCount: 1,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', value: this.recipe.description, optional: true },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/recipe']) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        if (this.ingredientGoods.length === 0) {
            this.ngxHelperToastService.error(`${KitchenGoodInfo.INGREDIENT.title} انتخاب نشده است.`);
            return;
        }

        const ID: string = this.recipe.id;
        const body: IKitchenRecipeUpdateRq = {
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
        this.apiService.request<IKitchenRecipeUpdateRs>('KitchenRecipeUpdate', { body, ids: { ID } }, () => {
            this.ngxHelperToastService.success('غذا با موفقیت ویرایش شد.');
            this.router.navigate(['/recipe']);
        });
    }
}
