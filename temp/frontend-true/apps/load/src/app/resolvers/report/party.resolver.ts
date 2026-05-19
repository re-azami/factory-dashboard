import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadReportPartyInfoRs } from '@lib/apis';

export const LoadReportPartyInfoResolver: ResolveFn<ILoadReportPartyInfoRs> = (route): Promise<ILoadReportPartyInfoRs> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadReportPartyInfoRs>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadReportPartyInfoRs>(
            'LoadReportPartyInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/report', 'party']);
                reject();
            },
        );
    });
};
