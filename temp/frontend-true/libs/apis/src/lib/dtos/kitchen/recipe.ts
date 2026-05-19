import { KitchenGood, KitchenMeal, KitchenUnit } from '@lib/shared';

export interface IKitchenRecipeGoodDTO {
    readonly id: string;
    readonly good: KitchenGood;
    readonly title: string;
    readonly unit: KitchenUnit;
    readonly serving: {
        readonly unit: string;
        readonly value: number;
        readonly description: string;
    } | null;
}

export interface IKitchenRecipeDTO {
    readonly id: string;
    readonly create: Date;
    readonly title: string;
    readonly meals: KitchenMeal[];
    readonly goods: IKitchenRecipeGoodDTO[];
    readonly description: string;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}

export interface IKitchenRecipeListDTO extends Pick<IKitchenRecipeDTO, 'id' | 'title' | 'meals'> {}
