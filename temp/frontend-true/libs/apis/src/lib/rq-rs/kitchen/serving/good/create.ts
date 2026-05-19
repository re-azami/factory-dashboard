import { IKitchenServingDTO } from '../../../../dtos';

export interface IKitchenServingGoodCreateRq {
    readonly good: string;
    readonly usage: {
        readonly unit: string;
        readonly value: number;
    } | null;
    readonly description: string;
}

export interface IKitchenServingGoodCreateRs extends IKitchenServingDTO {}
