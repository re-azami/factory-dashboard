import { ILoadOwnerDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadOwnerListRs {
    readonly list: ILoadOwnerDTO[];
    readonly pagination: IPaginationDTO;
}
