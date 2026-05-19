import { IOkDTO } from '../../../dtos';

export interface IKitchenGoodStatusRq {
    readonly active: boolean;
}

export interface IKitchenGoodStatusRs extends IOkDTO {}
