import { IKitchenServingDTO } from '../../../dtos';

export interface IKitchenServingUsageRq {
    readonly goods: {
        readonly id: string;
        readonly unit: string;
        readonly value: number;
    }[];
}

export interface IKitchenServingUsageRs extends IKitchenServingDTO {}
