import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadReportTruckInfoRs } from '@lib/apis';

export const LoadReportTruckInfoResolver: ResolveFn<ILoadReportTruckInfoRs> = (route): Promise<ILoadReportTruckInfoRs> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadReportTruckInfoRs>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadReportTruckInfoRs>(
            'LoadReportTruckInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/dashboard']);
                reject();
            },
        );
    });
};
