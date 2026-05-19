import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadReportTransporterInfoRs } from '@lib/apis';

export const LoadReportTransporterInfoResolver: ResolveFn<ILoadReportTransporterInfoRs> = (
    route,
): Promise<ILoadReportTransporterInfoRs> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadReportTransporterInfoRs>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadReportTransporterInfoRs>(
            'LoadReportTransporterInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/report', 'transporter']);
                reject();
            },
        );
    });
};
