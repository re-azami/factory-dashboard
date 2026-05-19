import { PersonnelGender, PersonnelStatus } from '@lib/shared';

export interface IPersonnelReportMemberRs {
    readonly total: number;
    readonly status: {
        readonly type: PersonnelStatus;
        readonly count: number;
    }[];
    readonly count: number;
    readonly genders: {
        readonly gender: PersonnelGender;
        readonly count: number;
    }[];
    readonly departments: {
        readonly id: string;
        readonly title: string;
        readonly count: number;
    }[];
    readonly positions: {
        readonly id: string;
        readonly title: string;
        readonly count: number;
    }[];
    readonly educations: {
        readonly id: string;
        readonly title: string;
        readonly count: number;
    }[];
}
