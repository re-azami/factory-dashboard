import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILoadReportCargoMonthRs } from '@lib/apis';

export const LoadReportCargoMonthResolver: ResolveFn<ILoadReportCargoMonthRs> = (
    route,
): Promise<ILoadReportCargoMonthRs> => {
    const apiService = inject(ApiService);

    return new Promise<ILoadReportCargoMonthRs>((resolve) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadReportCargoMonthRs>(
            'LoadReportCargoMonth',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
