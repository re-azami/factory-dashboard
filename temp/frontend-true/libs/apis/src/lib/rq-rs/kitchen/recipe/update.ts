import { KitchenMeal } from '@lib/shared';

import { IKitchenRecipeDTO } from '../../../dtos';

export interface IKitchenRecipeUpdateRq {
    readonly title: string;
    readonly meals: KitchenMeal[];
    readonly description: string;
    readonly goods: {
        readonly id: string;
        readonly servingUnit: string | null;
        readonly servingValue: number | null;
        readonly servingDescription: string | null;
    }[];
}

export interface IKitchenRecipeUpdateRs extends IKitchenRecipeDTO {}
