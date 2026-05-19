import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadCargoDTO, ILoadCargoInfoRs } from '@lib/apis';

export const LoadCargoResolver: ResolveFn<ILoadCargoDTO> = (route): Promise<ILoadCargoDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadCargoDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadCargoInfoRs>(
            'LoadCargoInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/cargo']);
                reject();
            },
        );
    });
};
