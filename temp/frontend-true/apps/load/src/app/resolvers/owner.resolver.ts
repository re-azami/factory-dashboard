import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadOwnerDTO, ILoadOwnerInfoRs } from '@lib/apis';

export const LoadOwnerResolver: ResolveFn<ILoadOwnerDTO> = (route): Promise<ILoadOwnerDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadOwnerDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadOwnerInfoRs>(
            'LoadOwnerInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/owner']);
                reject();
            },
        );
    });
};
