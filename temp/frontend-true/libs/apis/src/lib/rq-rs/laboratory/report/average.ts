import { LaboratoryCrusher, LaboratoryKhatka, LaboratoryResult } from '@lib/shared';

export interface ILaboratoryReportAverageRs {
    readonly from: Date;
    readonly to: Date;
    readonly test: LaboratoryResult;
    readonly crushers: {
        readonly crusher: LaboratoryCrusher;
        readonly count: number;
        readonly minimum: number;
        readonly maximum: number;
        readonly average: number;
    }[];
    readonly khatkas: {
        readonly khatka: LaboratoryKhatka;
        readonly count: number;
        readonly minimum: number;
        readonly maximum: number;
        readonly average: number;
    }[];
}
