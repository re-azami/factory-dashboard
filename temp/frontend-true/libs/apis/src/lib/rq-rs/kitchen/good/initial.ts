import { IKitchenGoodDTO } from '../../../dtos';

export interface IKitchenGoodInitialRq {
    readonly initial: {
        readonly unit: string;
        readonly value: number;
    } | null;
}

export interface IKitchenGoodInitialRs extends IKitchenGoodDTO {}
