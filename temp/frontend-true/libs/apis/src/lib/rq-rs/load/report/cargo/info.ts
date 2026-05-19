import { ILoadCargoDTO } from '../../../../dtos';

export interface ILoadReportCargoInfoRs {
    readonly cargo: ILoadCargoDTO;
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
}
