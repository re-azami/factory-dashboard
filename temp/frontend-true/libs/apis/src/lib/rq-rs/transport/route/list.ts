import { IPaginationDTO, ITransportRouteListDTO } from '../../../dtos';

export interface ITransportRouteListRs {
    readonly list: ITransportRouteListDTO[];
    readonly pagination: IPaginationDTO;
}
