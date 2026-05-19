import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ITransportRouteDTO, ITransportRouteInfoRs } from '@lib/apis';

export const TransportRouteResolver: ResolveFn<ITransportRouteDTO> = (route): Promise<ITransportRouteDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ITransportRouteDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('routeId') || '';
        apiService.request<ITransportRouteInfoRs>(
            'TransportRouteInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/route']);
                reject();
            },
        );
    });
};
