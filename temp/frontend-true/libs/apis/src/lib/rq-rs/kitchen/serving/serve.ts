import { IKitchenServingDTO } from '../../../dtos';

export interface IKitchenServingServeRq {
    readonly serving: number;
    readonly description: string;
}

export interface IKitchenServingServeRs extends IKitchenServingDTO {}
