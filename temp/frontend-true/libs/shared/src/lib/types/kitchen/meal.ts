export type KitchenMeal = 'BREAKFAST' | 'LUNCH' | 'DINNER';

interface IKitchenMeal {
    title: string;
    icon: string;
    color: string;
}

export const KitchenMealInfo: { [key in KitchenMeal]: IKitchenMeal } = {
    BREAKFAST: { title: 'صبحانه', icon: 'wb_twilight', color: '#1da756' },
    LUNCH: { title: 'ناهار', icon: 'light_mode', color: '#ff6600' },
    DINNER: { title: 'شام', icon: 'nightlight', color: '#0068b3' },
};

export const KitchenMealList: KitchenMeal[] = Object.keys(KitchenMealInfo) as KitchenMeal[];
