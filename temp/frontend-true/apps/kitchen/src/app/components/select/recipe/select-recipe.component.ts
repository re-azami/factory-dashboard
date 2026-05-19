import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { Helper } from '@webilix/helper-library';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperMenu, NgxHelperMenuModule } from '@webilix/ngx-helper/menu';

import { ApiService, IKitchenRecipeDTO, IKitchenRecipeListDTO } from '@lib/apis';
import { KitchenMeal, KitchenMealInfo, KitchenMealList } from '@lib/shared';

import { KitchenToolsService } from '../../../providers';

@Component({
    host: { selector: 'select-recipe' },
    imports: [MatButton, MatIcon, NgxHelperLoaderModule, NgxHelperMenuModule],
    templateUrl: './select-recipe.component.html',
    styleUrl: './select-recipe.component.scss',
})
export class SelectRecipeComponent implements OnInit {
    public kitchenMealInfo = KitchenMealInfo;

    public loading: boolean = true;
    public recipes: IKitchenRecipeListDTO[] = [];
    public filtered: IKitchenRecipeListDTO[] = [];

    public mealMenu: NgxHelperMenu[] = [
        ...KitchenMealList.map((meal: KitchenMeal) => ({
            title: KitchenMealInfo[meal].title,
            icon: KitchenMealInfo[meal].icon,
            click: () => this.setMeal(meal),
            disableOn: () => this.mealFilter === meal,
        })),
        'DIVIDER',
        {
            title: 'همه موارد',
            icon: 'flatware',
            click: () => this.setMeal(),
            disableOn: () => !this.mealFilter,
        },
    ];

    public meal?: KitchenMeal = this.data.meal;
    public mealFilter?: KitchenMeal = this.data.meal;
    public queryFilter: string = '';

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { meal?: KitchenMeal },
        private readonly apiService: ApiService,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly kitchenToolsService: KitchenToolsService,
    ) {}

    ngOnInit(): void {
        this.kitchenToolsService.getActiveRecipe().then((recipes: IKitchenRecipeListDTO[]) => {
            this.loading = false;
            this.recipes = recipes;

            this.filter();
        });
    }

    getMeals(meals: KitchenMeal[]): string {
        return meals.map((meal: KitchenMeal) => KitchenMealInfo[meal].title).join('، ');
    }

    setMeal(meal?: KitchenMeal): void {
        this.mealFilter = meal;
        this.filter();
    }

    setQuery(query: string): void {
        if (!Helper.IS.string(query)) query = '';
        query = query.trim();
        if (query === this.queryFilter) return;

        this.queryFilter = query;
        this.filter();
    }

    filter(): void {
        this.filtered = [...this.recipes]
            .filter((recipe: IKitchenRecipeListDTO) => !this.mealFilter || recipe.meals.includes(this.mealFilter))
            .filter((recipe: IKitchenRecipeListDTO) => !this.queryFilter || recipe.title.indexOf(this.queryFilter) !== -1);
    }

    select(recipe: IKitchenRecipeListDTO): void {
        const ID: string = recipe.id;
        this.apiService.request<IKitchenRecipeDTO>('KitchenRecipeInfo', { ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
