import { ILoadCargoDTO } from '../../../../dtos';

export interface ILoadCargoActivationCreateRq {
    readonly prior: string;
}

export interface ILoadCargoActivationCreateRs extends ILoadCargoDTO {}
