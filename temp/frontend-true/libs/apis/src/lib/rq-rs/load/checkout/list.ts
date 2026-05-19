import { ILoadCheckoutDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadCheckoutListRs {
    readonly list: ILoadCheckoutDTO[];
    readonly pagination: IPaginationDTO;
}
