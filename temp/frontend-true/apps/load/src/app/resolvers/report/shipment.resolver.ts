import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadReportShipmentInfoRs } from '@lib/apis';

export const LoadReportShipmentInfoResolver: ResolveFn<ILoadReportShipmentInfoRs> = (
    route,
): Promise<ILoadReportShipmentInfoRs> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadReportShipmentInfoRs>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadReportShipmentInfoRs>(
            'LoadReportShipmentInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/report', 'shipment']);
                reject();
            },
        );
    });
};
