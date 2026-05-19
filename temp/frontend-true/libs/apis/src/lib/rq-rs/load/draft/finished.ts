import { ILoadDraftDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadDraftFinishedRs {
    readonly list: ILoadDraftDTO[];
    readonly pagination: IPaginationDTO;
}
