import { IWarehouseCategoryDTO } from '@lib/apis';

export interface IWarehouseCategoryParent {
    readonly id: string;
    readonly title: string;
}

export interface IWarehouseCategory {
    readonly id: string;
    readonly dto: IWarehouseCategoryDTO;
    readonly indent: number;
    readonly fullKey: string;
    readonly fullTitle: string;
    readonly parents: IWarehouseCategoryParent[];
    readonly subs: IWarehouseCategory[];
}
