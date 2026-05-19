export interface ILoadReportCargoChartRs
    extends Array<{
        readonly day: string;
        readonly from: Date;
        readonly to: Date;
        readonly count: number;
        readonly weight: number;
    }> {}
