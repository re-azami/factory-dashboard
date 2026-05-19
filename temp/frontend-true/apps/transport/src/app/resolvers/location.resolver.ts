import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ITransportLocationDTO, ITransportLocationInfoRs } from '@lib/apis';

export const TransportLocationResolver: ResolveFn<ITransportLocationDTO> = (route): Promise<ITransportLocationDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ITransportLocationDTO>((resolve, reject) => {
        const group: string = route.paramMap.get('groupId') || '';
        const ID: string = route.paramMap.get('locationId') || '';
        apiService.request<ITransportLocationInfoRs>(
            'TransportLocationInfo',
            { ids: { ID }, params: { group }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/location']);
                reject();
            },
        );
    });
};
