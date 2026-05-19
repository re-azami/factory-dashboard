import { LaboratoryCrusher, LaboratoryLine } from '@lib/shared';

export interface ILaboratoryReportCrusherLocationRs {
    readonly from: Date;
    readonly to: Date;
    readonly crusher: LaboratoryCrusher;
    readonly tests: {
        readonly line: LaboratoryLine;
        readonly time: {
            readonly begin: Date;
            readonly end: Date;
        };
        readonly fe: number | null;
        readonly feo: number | null;
        readonly grind: number | null;
        readonly moisture: number | null;
        readonly sulphur: number | null;
    }[];
}
