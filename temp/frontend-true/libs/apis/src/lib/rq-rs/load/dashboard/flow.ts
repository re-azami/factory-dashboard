import { LoadFlow } from '@lib/shared';

export interface ILoadDashboardFlowRs {
    readonly flows: {
        readonly flow: LoadFlow;
        readonly count: number;
    }[];
    readonly traffic: {
        readonly enter: number;
        readonly exit: number;
    };
    readonly traffic_mine: {
        readonly enter: number;
        readonly exit: number;
    };
    readonly weight: {
        readonly empty: number;
        readonly full: number;
    };
}
