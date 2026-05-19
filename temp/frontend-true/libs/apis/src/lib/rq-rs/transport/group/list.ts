import { ITransportGroupDTO, IPaginationDTO } from '../../../dtos';

export interface ITransportGroupListRs {
    readonly list: ITransportGroupDTO[];
    readonly pagination: IPaginationDTO;
}
