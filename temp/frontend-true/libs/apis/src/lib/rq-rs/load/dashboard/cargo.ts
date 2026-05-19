import { LoadCargo } from '@lib/shared';

export interface ILoadDashboardCargoRs
    extends Array<{
        readonly id: string;
        readonly title: string;
        readonly type: LoadCargo;
        readonly party: {
            readonly id: string;
            readonly title: string;
        };
        readonly shipment: {
            readonly id: string;
            readonly title: string;
        };
        readonly daily: {
            readonly active: number;
            readonly count: number;
            readonly weight: number;
        };
        readonly total: {
            readonly count: number;
            readonly weight: number;
            readonly remaining: number;
        };
    }> {}
