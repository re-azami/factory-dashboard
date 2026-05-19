import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, IWarehouseStockDTO, IWarehouseStockInfoRs } from '@lib/apis';

export const WarehouseStockResolver: ResolveFn<IWarehouseStockDTO> = (route): Promise<IWarehouseStockDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<IWarehouseStockDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('stockId') || '';
        apiService.request<IWarehouseStockInfoRs>(
            'WarehouseStockInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/stock']);
                reject();
            },
        );
    });
};
