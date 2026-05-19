import { LoadCargo } from '@lib/shared';

export interface ILoadReportTransporterDraftRs {
    readonly count: number;
    readonly weight: number;
    readonly parties: {
        readonly id: string;
        readonly title: string;
        readonly count: number;
        readonly weight: number;
    }[];
    readonly shipments: {
        readonly id: string;
        readonly title: string;
        readonly count: number;
        readonly weight: number;
    }[];
    readonly cargos: {
        readonly id: string;
        readonly title: string;
        readonly type: LoadCargo;
        readonly count: number;
        readonly weight: number;
    }[];
    readonly owners: {
        readonly id: string;
        readonly name: string;
        readonly count: number;
        readonly weight: number;
    }[];
}
