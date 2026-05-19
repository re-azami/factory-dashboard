import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadReportOwnerInfoRs } from '@lib/apis';

export const LoadReportOwnerInfoResolver: ResolveFn<ILoadReportOwnerInfoRs> = (route): Promise<ILoadReportOwnerInfoRs> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadReportOwnerInfoRs>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadReportOwnerInfoRs>(
            'LoadReportOwnerInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/report', 'owner']);
                reject();
            },
        );
    });
};
