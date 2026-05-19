import { ILaboratoryCargoDTO } from '../../../dtos';

export interface ILaboratoryCargoShareRq {
    readonly cargo: string;
}

export interface ILaboratoryCargoShareRs extends ILaboratoryCargoDTO {}
