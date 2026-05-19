import { IWarehouseStockDTO } from '../../../dtos';

export interface IWarehouseStockUpdateRq {
    readonly category: string;
    readonly title: string;
}

export interface IWarehouseStockUpdateRs extends IWarehouseStockDTO {}
