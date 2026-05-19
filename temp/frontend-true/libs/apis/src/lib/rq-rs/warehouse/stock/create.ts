import { IWarehouseStockDTO } from '../../../dtos';

export interface IWarehouseStockCreateRq {
    readonly category: string;
    readonly title: string;
}

export interface IWarehouseStockCreateRs extends IWarehouseStockDTO {}
