import { KitchenMeal } from '@lib/shared';

export interface IKitchenDashboardCountRs {
    readonly good: number;
    readonly recipe: number;
    readonly serving: {
        readonly active: number;
        readonly done: number;
    };
    readonly meals: {
        readonly meal: KitchenMeal;
        readonly count: number;
        readonly serving: number;
    }[];
}
