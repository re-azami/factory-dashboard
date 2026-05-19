import { KitchenInventory } from '@lib/shared';

import { IKitchenGoodDTO } from '../../../dtos';

export interface IKitchenInventoryUpdateRq {
    readonly type: KitchenInventory;
    readonly good: string;
    readonly date: Date;
    readonly value: {
        readonly unit: string;
        readonly value: number;
    };
    readonly description: string;
}

export interface IKitchenInventoryUpdateRs extends IKitchenGoodDTO {}
