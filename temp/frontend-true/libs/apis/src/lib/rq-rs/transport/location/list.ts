import { ITransportLocationDTO, IPaginationDTO } from '../../../dtos';

export interface ITransportLocationListRs {
    readonly list: ITransportLocationDTO[];
    readonly pagination: IPaginationDTO;
}
