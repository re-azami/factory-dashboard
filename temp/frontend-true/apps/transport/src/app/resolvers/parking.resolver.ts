import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ITransportParkingDTO, ITransportParkingInfoRs } from '@lib/apis';

export const TransportParkingResolver: ResolveFn<ITransportParkingDTO> = (route): Promise<ITransportParkingDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ITransportParkingDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('parkingId') || '';
        apiService.request<ITransportParkingInfoRs>(
            'TransportParkingInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/parking']);
                reject();
            },
        );
    });
};
