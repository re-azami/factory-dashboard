import { ILaboratorySupplementaryDTO } from '../../../dtos';

export interface ILaboratorySupplementaryUpdateRq {
    readonly title: string;
    readonly description: string;
}

export interface ILaboratorySupplementaryUpdateRs extends ILaboratorySupplementaryDTO {}
