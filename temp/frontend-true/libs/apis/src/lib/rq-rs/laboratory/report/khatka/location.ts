import { LaboratoryKhatka, LaboratoryLine } from '@lib/shared';

export interface ILaboratoryReportKhatkaLocationRs {
    readonly from: Date;
    readonly to: Date;
    readonly khatka: LaboratoryKhatka;
    readonly tests: {
        readonly line: LaboratoryLine;
        readonly time: {
            readonly begin: Date;
            readonly end: Date;
        };
        readonly tonnage: {
            readonly feed: number | null;
            readonly product: number | null;
        };
        readonly fe: number | null;
        readonly feo: number | null;
        readonly grind: number | null;
        readonly moisture: number | null;
        readonly sulphur: number | null;
    }[];
}
