import { IOkDTO } from '../../../dtos';

export interface IKitchenRecipeStatusRq {
    readonly active: boolean;
}

export interface IKitchenRecipeStatusRs extends IOkDTO {}
