import { IOkDTO } from '../../../dtos';

export interface ILaboratoryCargoStatusRq {
    readonly active: boolean;
}

export interface ILaboratoryCargoStatusRs extends IOkDTO {}
