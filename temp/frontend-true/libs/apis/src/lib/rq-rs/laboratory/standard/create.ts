import { ILaboratoryStandardDTO } from '../../../dtos';

export interface ILaboratoryStandardCreateRq {
    readonly weight: number;
    readonly volume: number;
    readonly standard: number;
}

export interface ILaboratoryStandardCreateRs extends ILaboratoryStandardDTO {}
