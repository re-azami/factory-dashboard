import { KitchenGood, KitchenUnit } from '@lib/shared';

import { IKitchenGoodDTO } from '../../../dtos';

export interface IKitchenGoodUpdateRq {
    readonly good: KitchenGood;
    readonly title: string;
    readonly group: string | null;
    readonly unit: KitchenUnit;
    readonly description: string;
    readonly dashboard: boolean;
}

export interface IKitchenGoodUpdateRs extends IKitchenGoodDTO {}
