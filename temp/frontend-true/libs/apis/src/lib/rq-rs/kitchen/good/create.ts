import { KitchenGood, KitchenUnit } from '@lib/shared';

import { IKitchenGoodDTO } from '../../../dtos';

export interface IKitchenGoodCreateRq {
    readonly good: KitchenGood;
    readonly title: string;
    readonly group: string | null;
    readonly unit: KitchenUnit;
    readonly inventory: {
        readonly unit: string;
        readonly value: number;
    } | null;
    readonly description: string;
    readonly dashboard: boolean;
}

export interface IKitchenGoodCreateRs extends IKitchenGoodDTO {}
