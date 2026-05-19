import { ILoadTruckDTO } from '../../../../dtos';

export interface ILoadReportTruckInfoRs {
    readonly truck: ILoadTruckDTO;
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
}
