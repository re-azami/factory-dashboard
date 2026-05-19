import { IWarehouseStockDTO } from '../../../dtos';

export interface IWarehouseStockTitleRq {
    readonly title: string;
}

export interface IWarehouseStockTitleRs extends IWarehouseStockDTO {}
