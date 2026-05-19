import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadReportCargoInfoRs } from '@lib/apis';

export const LoadReportCargoInfoResolver: ResolveFn<ILoadReportCargoInfoRs> = (route): Promise<ILoadReportCargoInfoRs> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadReportCargoInfoRs>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadReportCargoInfoRs>(
            'LoadReportCargoInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/report', 'cargo']);
                reject();
            },
        );
    });
};
