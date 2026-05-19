import { ILoadOwnerDTO } from '../../../../dtos';

export interface ILoadReportOwnerInfoRs {
    readonly owner: ILoadOwnerDTO;
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
}
