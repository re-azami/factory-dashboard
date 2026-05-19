import { KitchenInventory, KitchenMeal } from '@lib/shared';

export interface IKitchenInventoryDTO {
    readonly id: string;
    readonly date: Date;
    readonly type: KitchenInventory;
    readonly value: {
        readonly unit: string;
        readonly value: number;
    };
    readonly serving: {
        readonly recipe: {
            readonly id: string;
            readonly title: string;
        };
        readonly meal: KitchenMeal;
    };
    readonly inventory: number;
    readonly description: string;
}
