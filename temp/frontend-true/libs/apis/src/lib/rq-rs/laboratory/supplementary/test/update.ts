import { ILaboratorySupplementaryTestDTO } from '../../../../dtos';

export interface ILaboratorySupplementaryTestUpdateRq {
    readonly date: Date;
    readonly fe: string | null;
    readonly feo: string | null;
    readonly grind: string | null;
    readonly moisture: string | null;
    readonly sulphur: string | null;
    readonly gauss: number | null;
    readonly recovery: string | null;
    readonly productFe: string | null;
    readonly productFeo: string | null;
    readonly tailFe: string | null;
    readonly tailFeo: string | null;
}

export interface ILaboratorySupplementaryTestUpdateRs extends ILaboratorySupplementaryTestDTO {}
