import { ILoadPartyDTO } from '../../../../dtos';

export interface ILoadReportPartyInfoRs {
    readonly party: ILoadPartyDTO;
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
}
