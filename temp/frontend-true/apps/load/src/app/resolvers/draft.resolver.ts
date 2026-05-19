import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadDraftDTO, ILoadDraftInfoRs } from '@lib/apis';

export const LoadDraftResolver: ResolveFn<ILoadDraftDTO> = (route): Promise<ILoadDraftDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadDraftDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadDraftInfoRs>(
            'LoadDraftInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/dashboard']);
                reject();
            },
        );
    });
};
