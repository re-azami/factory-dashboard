import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { IKitchenServingDTO } from '@lib/apis';
import { KitchenGood, KitchenGoodInfo, KitchenGoodList, KitchenMealInfo } from '@lib/shared';

import { KitchenServingService, KitchenUnitService } from '../../../providers';

interface IGood {
    title: string;
    amount: string;
}

@Component({
    host: { selector: 'serving-info' },
    imports: [MatButton, MatIcon, DecimalPipe, NgxHelperPipeModule],
    templateUrl: './serving-info.component.html',
    styleUrl: './serving-info.component.scss',
})
export class ServingInfoComponent implements OnInit {
    public kitchenGoodList = KitchenGoodList;
    public kitchenGoodInfo = KitchenGoodInfo;
    public kitchenMealInfo = KitchenMealInfo;

    public serving: IKitchenServingDTO = this.data.serving;
    public goods!: { [key in KitchenGood]: IGood[] };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { serving: IKitchenServingDTO },
        private readonly kitchenServingService: KitchenServingService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    ngOnInit(): void {
        const getGoods = (good: KitchenGood): IGood[] => {
            return this.serving.goods
                .filter((g) => g.good === good)
                .map((good) => ({
                    title: good.title,
                    amount: this.data.serving.isServed
                        ? good.usage?.amount
                            ? this.kitchenUnitService.valueTitle(good.unit, good.usage.amount)
                            : ''
                        : this.kitchenServingService.servingPipe(good, this.serving.serving),
                }));
        };

        this.goods = {
            INGREDIENT: getGoods('INGREDIENT'),
            ADDITIVE: getGoods('ADDITIVE'),
            CONSUMABLE: getGoods('CONSUMABLE'),
        };
    }

    download(): void {
        this.kitchenServingService.download(this.serving.id);
    }
}
