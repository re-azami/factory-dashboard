import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ITransportStationDTO, ITransportStationInfoRs } from '@lib/apis';

export const TransportStationResolver: ResolveFn<ITransportStationDTO> = (route): Promise<ITransportStationDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ITransportStationDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('stationId') || '';
        apiService.request<ITransportStationInfoRs>(
            'TransportStationInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/station']);
                reject();
            },
        );
    });
};
