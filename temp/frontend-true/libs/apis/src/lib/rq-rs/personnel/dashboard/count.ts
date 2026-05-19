import { PersonnelStatus } from '@lib/shared';

export interface IPersonnelDashboardCountRs {
    readonly count: number;
    readonly status: {
        readonly type: PersonnelStatus;
        readonly count: number;
    }[];
}
