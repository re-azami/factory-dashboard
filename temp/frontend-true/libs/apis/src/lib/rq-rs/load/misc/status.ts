import { IOkDTO } from '../../../dtos';

export interface ILoadMiscStatusRq {
    readonly active: boolean;
}

export interface ILoadMiscStatusRs extends IOkDTO {}
