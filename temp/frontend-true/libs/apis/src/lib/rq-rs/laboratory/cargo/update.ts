import { ILaboratoryCargoDTO } from '../../../dtos';

export interface ILaboratoryCargoUpdateRq {
    readonly title: string;
}

export interface ILaboratoryCargoUpdateRs extends ILaboratoryCargoDTO {}
