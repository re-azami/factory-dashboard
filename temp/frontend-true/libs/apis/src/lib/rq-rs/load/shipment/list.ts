import { ILoadShipmentDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadShipmentListRs {
    readonly list: ILoadShipmentDTO[];
    readonly pagination: IPaginationDTO;
}
