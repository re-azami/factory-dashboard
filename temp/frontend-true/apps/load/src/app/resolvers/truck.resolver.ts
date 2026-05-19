import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadTruckDTO, ILoadTruckInfoRs } from '@lib/apis';

export const LoadTruckResolver: ResolveFn<ILoadTruckDTO> = (route): Promise<ILoadTruckDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadTruckDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadTruckInfoRs>(
            'LoadTruckInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/truck']);
                reject();
            },
        );
    });
};
