import { IOkDTO } from '../../../dtos';

export interface IPersonnelGroupStatusRq {
    readonly active: boolean;
}

export interface IPersonnelGroupStatusRs extends IOkDTO {}
