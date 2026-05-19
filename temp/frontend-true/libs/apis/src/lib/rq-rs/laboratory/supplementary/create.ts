import { ILaboratorySupplementaryDTO } from '../../../dtos';

export interface ILaboratorySupplementaryCreateRq {
    readonly title: string;
    readonly description: string;
}

export interface ILaboratorySupplementaryCreateRs extends ILaboratorySupplementaryDTO {}
