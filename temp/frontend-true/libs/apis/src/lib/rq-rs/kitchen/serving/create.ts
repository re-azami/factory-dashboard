import { KitchenMeal } from '@lib/shared';

import { IKitchenServingDTO } from '../../../dtos';

export interface IKitchenServingCreateRq {
    readonly date: Date;
    readonly meal: KitchenMeal;
    readonly recipe: string;
    readonly serving: number;
    readonly description: string;
}

export interface IKitchenServingCreateRs extends IKitchenServingDTO {}
