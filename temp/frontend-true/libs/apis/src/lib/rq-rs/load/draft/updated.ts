import { ILoadDraftDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadDraftUpdatedRs {
    readonly list: ILoadDraftDTO[];
    readonly pagination: IPaginationDTO;
}
