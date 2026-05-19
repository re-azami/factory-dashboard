export interface IEducationDashboardStudyRs
    extends Array<{
        readonly title: string;
        readonly from: Date;
        readonly to: Date;
        readonly study: number;
        readonly participant: number;
        readonly hour: number;
    }> {}
