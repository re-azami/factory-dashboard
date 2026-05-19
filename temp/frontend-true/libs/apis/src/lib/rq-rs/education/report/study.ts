export interface IEducationReportStudyRs {
    readonly study: number;
    readonly duration: number;
    readonly participant: number;
    readonly hour: number;
    readonly expense: {
        readonly educator: number;
        readonly extra: number;
        readonly total: number;
    };
    readonly courses: {
        readonly id: string;
        readonly title: string;
        readonly study: string;
    }[];
    readonly institutes: {
        readonly id: string;
        readonly title: string;
        readonly study: string;
    }[];
    readonly mentors: {
        readonly id: string;
        readonly title: string;
        readonly study: string;
    }[];
}
