import { IKitchenServingDTO } from '../../../dtos';

export interface IKitchenServingUpdateRq {
    readonly recipe: string;
    readonly serving: number;
    readonly description: string;
}

export interface IKitchenServingUpdateRs extends IKitchenServingDTO {}
