import { IWarehouseStockDTO, IPaginationDTO } from '../../../dtos';

export interface IWarehouseStockListRs {
    readonly list: IWarehouseStockDTO[];
    readonly pagination: IPaginationDTO;
}
