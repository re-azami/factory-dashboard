import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, IKitchenGoodDTO, IKitchenGoodInfoRs } from '@lib/apis';

export const KitchenGoodResolver: ResolveFn<IKitchenGoodDTO> = (route): Promise<IKitchenGoodDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<IKitchenGoodDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<IKitchenGoodInfoRs>(
            'KitchenGoodInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/good']);
                reject();
            },
        );
    });
};
