import { IWarehouseCategoryDTO } from '../../../dtos';

export interface IWarehouseCategoryUpdateRq {
    readonly parent: string | null;
    readonly key: string;
    readonly title: string;
}

export interface IWarehouseCategoryUpdateRs extends IWarehouseCategoryDTO {}
