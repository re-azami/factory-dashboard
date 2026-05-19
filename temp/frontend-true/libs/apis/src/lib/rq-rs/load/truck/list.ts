import { ILoadTruckDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadTruckListRs {
    readonly list: ILoadTruckDTO[];
    readonly pagination: IPaginationDTO;
}
