import { IWarehouseCategoryDTO } from '../../../dtos';

export interface IWarehouseCategoryJoinRq {
    readonly indent: number;
    readonly parent: string;
    readonly child: string;
    readonly key: string;
    readonly title: string;
}

export interface IWarehouseCategoryJoinRs extends IWarehouseCategoryDTO {}
