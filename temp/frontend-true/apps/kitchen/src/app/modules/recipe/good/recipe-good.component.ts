import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Helper, UnitLength, UnitVolume, UnitWeight } from '@webilix/helper-library';
import { NgxHelperBottomSheetService, NgxHelperConfirmService } from '@webilix/ngx-helper';

import { IKitchenGoodDTO, IKitchenRecipeGoodDTO } from '@lib/apis';
import { KitchenGood, KitchenGoodInfo, KitchenUnit } from '@lib/shared';

import { KitchenToolsService } from '../../../providers';

import { RecipeGoodServingComponent } from './serving/recipe-good-serving.component';

@Component({
    selector: 'recipe-good',
    standalone: false,
    templateUrl: './recipe-good.component.html',
    styleUrl: './recipe-good.component.scss',
})
export class RecipeGoodComponent {
    @Input({ required: true }) good!: KitchenGood;
    @Input({ required: true }) goods!: IKitchenRecipeGoodDTO[];
    @Output() goodsChange: EventEmitter<IKitchenRecipeGoodDTO[]> = new EventEmitter<IKitchenRecipeGoodDTO[]>();

    public kitchenGoodInfo = KitchenGoodInfo;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly kitchenToolsService: KitchenToolsService,
    ) {}

    setGood(
        good: { id: string; good: KitchenGood; title: string; unit: KitchenUnit },
        serving?: { unit: string; value: number; description: string },
    ): void {
        const recipeGood = this.goods.find((g) => g.id === good.id);
        if (recipeGood) {
            Object.assign(recipeGood, { serving: serving || null });
            this.goodsChange.next(this.goods);
        } else {
            const recipeGood: IKitchenRecipeGoodDTO = { ...good, serving: serving || null };
            this.goods = [...this.goods, recipeGood].sort((g1, g2) => g1.title.localeCompare(g2.title));
            this.goodsChange.next(this.goods);
        }
    }

    getUnitTitle(good: IKitchenRecipeGoodDTO): string {
        if (!good.serving) return '';

        switch (good.unit) {
            case 'WEIGHT':
                const wUnit: UnitWeight = good.serving.unit as UnitWeight;
                return Helper.UNIT.WEIGHT.list.includes(wUnit) ? Helper.UNIT.WEIGHT.getTitle(wUnit) : '';

            case 'VOLUME':
                const vUnit: UnitVolume = good.serving.unit as UnitVolume;
                return Helper.UNIT.VOLUME.list.includes(vUnit) ? Helper.UNIT.VOLUME.getTitle(vUnit) : '';

            case 'LENGTH':
                const lUnit: UnitLength = good.serving.unit as UnitLength;
                return Helper.UNIT.LENGTH.list.includes(lUnit) ? Helper.UNIT.LENGTH.getTitle(lUnit) : '';

            case 'COUNT':
                return 'عدد';
        }
    }

    createGood(): void {
        const ignore: string[] = this.goods.map((g) => g.id);
        this.kitchenToolsService.selectGood(this.good, ignore).then((good: IKitchenGoodDTO) => {
            if (good.good !== this.good) return;

            switch (this.good) {
                case 'INGREDIENT':
                    this.ngxHelperBottomSheetService.open<{ unit: string; value: number; description: string }>(
                        RecipeGoodServingComponent,
                        'مقدار هر وعده',
                        { data: { title: good.title, unit: good.unit } },
                        (serving) => this.setGood(good, serving),
                    );
                    break;

                case 'ADDITIVE':
                case 'CONSUMABLE':
                    this.setGood(good);
                    break;
            }
        });
    }

    updateGood(good: IKitchenRecipeGoodDTO): void {
        if (good.good !== 'INGREDIENT') return;
        this.ngxHelperBottomSheetService.open<{ unit: string; value: number; description: string }>(
            RecipeGoodServingComponent,
            'مقدار هر وعده',
            { data: { title: good.title, unit: good.unit, serving: good.serving } },
            (serving) => this.setGood(good, serving),
        );
    }

    deleteGood(good: IKitchenRecipeGoodDTO): void {
        const item: string = KitchenGoodInfo[this.good].title;
        const title: string = good.title;

        this.ngxHelperConfirmService.delete(item, { title }, () => {
            this.goods = this.goods.filter((g) => g.id !== good.id);
            this.goodsChange.next(this.goods);
        });
    }
}
