import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IWarehouseCategoryListRs } from '@lib/apis';

import { IWarehouseCategory } from '../app.interface';
import { WarehouseToolsService } from '../providers';

export const WarehouseCategoriesResolver: ResolveFn<IWarehouseCategory[]> = (): Promise<IWarehouseCategory[]> => {
    const warehouseToolsService = inject(WarehouseToolsService);
    const apiService = inject(ApiService);

    return new Promise<IWarehouseCategory[]>((resolve) => {
        apiService.request<IWarehouseCategoryListRs>(
            'WarehouseCategoryList',
            { silent: true },
            (response) => resolve(warehouseToolsService.initCategories(response)),
            () => resolve([]),
        );
    });
};
