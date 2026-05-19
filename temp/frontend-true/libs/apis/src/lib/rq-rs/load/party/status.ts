import { IOkDTO } from '../../../dtos';

export interface ILoadPartyStatusRq {
    readonly active: boolean;
}

export interface ILoadPartyStatusRs extends IOkDTO {}
