import { ILaboratoryLoadDTO } from '../../../dtos';

export interface ILaboratoryLoadUpdateRq {
    readonly fe: string | null;
    readonly feo: string | null;
    readonly grind: string | null;
    readonly moisture: string | null;
    readonly sulphur: string | null;
    readonly description: string;
}

export interface ILaboratoryLoadUpdateRs extends ILaboratoryLoadDTO {}
