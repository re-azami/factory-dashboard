import { ITransportParkingDTO, IPaginationDTO } from '../../../dtos';

export interface ITransportParkingListRs {
    readonly list: ITransportParkingDTO[];
    readonly pagination: IPaginationDTO;
}
