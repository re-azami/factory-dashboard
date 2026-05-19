import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, IKitchenServingInfoRs, IKitchenServingDTO } from '@lib/apis';

export const KitchenServingResolver: ResolveFn<IKitchenServingDTO> = (route): Promise<IKitchenServingDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<IKitchenServingDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<IKitchenServingInfoRs>(
            'KitchenServingInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/calendar']);
                reject();
            },
        );
    });
};
