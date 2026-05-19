export interface ILoadTruckDraftRs {
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
    readonly daily: {
        readonly date: Date;
        readonly count: number;
        readonly weight: number;
    }[];
}
