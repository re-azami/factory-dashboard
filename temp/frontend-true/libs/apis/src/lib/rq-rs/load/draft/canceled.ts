import { ILoadDraftDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadDraftCanceledRs {
    readonly list: ILoadDraftDTO[];
    readonly pagination: IPaginationDTO;
}
