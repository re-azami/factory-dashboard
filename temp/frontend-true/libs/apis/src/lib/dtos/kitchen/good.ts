import { KitchenGood, KitchenUnit } from '@lib/shared';

export interface IKitchenGoodDTO {
    readonly id: string;
    readonly create: Date;
    readonly good: KitchenGood;
    readonly title: string;
    readonly group: {
        readonly id: string;
        readonly title: string;
    } | null;
    readonly unit: KitchenUnit;
    readonly initial: {
        readonly unit: string;
        readonly value: number;
    } | null;
    readonly inventory: number;
    readonly description: string;
    readonly dashboard: boolean;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}

export interface IKitchenGoodListDTO extends Pick<IKitchenGoodDTO, 'id' | 'good' | 'title' | 'group'> {}
