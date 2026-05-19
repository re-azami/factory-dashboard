import { KitchenMeal } from '@lib/shared';

export interface IKitchenDashboardCalendarDTO {
    readonly id: string;
    readonly date: Date;
    readonly meal: KitchenMeal;
    readonly recipe: {
        readonly id: string;
        readonly title: string;
    };
    readonly isServed: boolean;
}

export interface IKitchenDashboardCalendarRs extends Array<IKitchenDashboardCalendarDTO> {}
