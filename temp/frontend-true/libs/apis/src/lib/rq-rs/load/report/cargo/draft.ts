export interface ILoadReportCargoDraftRs {
    readonly count: number;
    readonly weight: number;
    readonly transporters: {
        readonly id: string;
        readonly title: string;
        readonly count: number;
        readonly weight: number;
    }[];
    readonly owners: {
        readonly id: string;
        readonly name: string;
        readonly count: number;
        readonly weight: number;
    }[];
}
