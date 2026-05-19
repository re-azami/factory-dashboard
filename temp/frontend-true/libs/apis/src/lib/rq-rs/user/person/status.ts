import { IOkDTO } from '../../../dtos';

export interface IUserPersonStatusRq {
    readonly active: boolean;
}

export interface IUserPersonStatusRs extends IOkDTO {}
