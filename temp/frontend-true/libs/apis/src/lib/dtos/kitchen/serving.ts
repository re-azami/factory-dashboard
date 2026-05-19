import { KitchenGood, KitchenMeal, KitchenUnit } from '@lib/shared';

export interface IKitchenServingGoodDTO {
    readonly id: string;
    readonly good: KitchenGood;
    readonly title: string;
    readonly unit: KitchenUnit;
    readonly serving: {
        readonly unit: string;
        readonly value: number;
    } | null;
    readonly usage: {
        readonly amount: number;
        readonly unit: string;
        readonly value: number;
    } | null;
}

export interface IKitchenServingDTO {
    readonly id: string;
    readonly date: Date;
    readonly meal: KitchenMeal;
    readonly recipe: {
        readonly id: string;
        readonly title: string;
    };
    readonly goods: IKitchenServingGoodDTO[];
    readonly serving: number;
    readonly isServed: boolean;
}
