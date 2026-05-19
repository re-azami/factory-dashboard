export interface ILoadReportCargoMonthRs
    extends Array<{
        readonly month: string;
        readonly title: string;
        readonly from: Date;
        readonly to: Date;
        readonly count: number;
        readonly weight: number;
    }> {}
