import { ILoadCargoDTO } from '../../../dtos';

export interface ILoadCargoDeactivationRq {
    readonly active: boolean;
    readonly weight: number;
}

export interface ILoadCargoDeactivationRs extends ILoadCargoDTO {}
