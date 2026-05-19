import { LoadCargo } from '@lib/shared';

export interface ILoadDashboardChartRs
    extends Array<{
        readonly title: string;
        readonly from: Date;
        readonly to: Date;
        readonly count: number;
        readonly weight: number;
        readonly cargos: {
            readonly cargo: LoadCargo;
            readonly count: number;
            readonly weight: number;
        }[];
    }> {}
