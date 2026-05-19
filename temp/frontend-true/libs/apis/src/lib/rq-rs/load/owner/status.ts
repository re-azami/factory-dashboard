import { IOkDTO } from '../../../dtos';

export interface ILoadOwnerStatusRq {
    readonly active: boolean;
}

export interface ILoadOwnerStatusRs extends IOkDTO {}
