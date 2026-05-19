import { IKitchenGroupDTO } from '../../../dtos';

export interface IKitchenGroupUpdateRq {
    readonly title: string;
}

export interface IKitchenGroupUpdateRs extends IKitchenGroupDTO {}
