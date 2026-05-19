import { IKitchenGroupDTO } from '../../../dtos';

export interface IKitchenGroupCreateRq {
    readonly title: string;
}

export interface IKitchenGroupCreateRs extends IKitchenGroupDTO {}
