import { LoadCargo } from '@lib/shared';

export interface ILoadDashboardCargoTypeRs {
    readonly count: number;
    readonly weight: number;
    readonly types: {
        readonly type: LoadCargo;
        readonly count: number;
        readonly weight: number;
    }[];
}
