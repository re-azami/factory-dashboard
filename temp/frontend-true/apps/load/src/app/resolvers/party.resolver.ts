import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadPartyDTO, ILoadPartyInfoRs } from '@lib/apis';

export const LoadPartyResolver: ResolveFn<ILoadPartyDTO> = (route): Promise<ILoadPartyDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadPartyDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadPartyInfoRs>(
            'LoadPartyInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/party']);
                reject();
            },
        );
    });
};
