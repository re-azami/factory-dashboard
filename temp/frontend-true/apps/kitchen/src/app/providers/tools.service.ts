import { Injectable } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IKitchenActiveRecipeRs, IKitchenGoodDTO, IKitchenRecipeDTO, IKitchenRecipeListDTO } from '@lib/apis';
import { KitchenGood, KitchenGoodInfo, KitchenMeal, KitchenMealInfo } from '@lib/shared';

import { ScanComponent } from '../components/scan/scan.component';
import { SelectGoodComponent } from '../components/select/good/select-good.component';
import { SelectRecipeComponent } from '../components/select/recipe/select-recipe.component';

@Injectable({ providedIn: 'root' })
export class KitchenToolsService {
    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    scanBarcode(): void {
        this.ngxHelperBottomSheetService.open(ScanComponent, 'اسکن بارکد', { disableClose: true });
    }

    selectGood(good?: KitchenGood, ignore?: string[]): Promise<IKitchenGoodDTO> {
        const title: string = good ? `انتخاب ${KitchenGoodInfo[good].title}` : 'انتخاب کالا';
        return new Promise<IKitchenGoodDTO>((resolve) => {
            this.ngxHelperBottomSheetService.open<IKitchenGoodDTO>(
                SelectGoodComponent,
                title,
                { data: { good, ignore }, padding: '0' },
                (response) => resolve(response),
            );
        });
    }

    getActiveRecipe(meal?: KitchenMeal): Promise<IKitchenRecipeListDTO[]> {
        return new Promise<IKitchenRecipeListDTO[]>((resolve) => {
            this.apiService.request<IKitchenActiveRecipeRs>(
                'KitchenActiveRecipe',
                { silent: true, loading: false },
                (response) => resolve(response.filter((recipe) => !meal || recipe.meals.includes(meal))),
                () => resolve([]),
            );
        });
    }

    selectRecipe(meal?: KitchenMeal): Promise<IKitchenRecipeDTO> {
        const title: string = meal ? `انتخاب ${KitchenMealInfo[meal].title}` : 'انتخاب غذا';
        return new Promise<IKitchenRecipeDTO>((resolve) => {
            this.ngxHelperBottomSheetService.open<IKitchenRecipeDTO>(
                SelectRecipeComponent,
                title,
                { data: { meal }, padding: '0' },
                (response) => resolve(response),
            );
        });
    }
}
