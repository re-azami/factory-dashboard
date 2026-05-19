import { IOkDTO } from '../../../dtos';

export interface IEducationLocationStatusRq {
    readonly active: boolean;
}

export interface IEducationLocationStatusRs extends IOkDTO {}
