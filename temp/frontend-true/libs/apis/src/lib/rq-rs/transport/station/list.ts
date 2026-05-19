import { IPaginationDTO, ITransportStationListDTO } from '../../../dtos';

export interface ITransportStationListRs {
    readonly list: ITransportStationListDTO[];
    readonly pagination: IPaginationDTO;
}
