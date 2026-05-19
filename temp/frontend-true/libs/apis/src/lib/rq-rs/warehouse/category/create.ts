import { IWarehouseCategoryDTO } from '../../../dtos';

export interface IWarehouseCategoryCreateRq {
    readonly parent: string | null;
    readonly key: string;
    readonly title: string;
}

export interface IWarehouseCategoryCreateRs extends IWarehouseCategoryDTO {}
