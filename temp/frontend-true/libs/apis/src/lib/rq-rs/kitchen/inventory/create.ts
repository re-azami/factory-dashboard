import { KitchenInventory } from '@lib/shared';

import { IKitchenGoodDTO } from '../../../dtos';

export interface IKitchenInventoryCreateRq {
    readonly type: KitchenInventory;
    readonly good: string;
    readonly date: Date;
    readonly value: {
        readonly unit: string;
        readonly value: number;
    };
    readonly description: string;
}

export interface IKitchenInventoryCreateRs extends IKitchenGoodDTO {}
