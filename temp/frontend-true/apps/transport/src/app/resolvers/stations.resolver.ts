import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IOptionDTO, ITransportStationFullRs } from '@lib/apis';

export const TransportStationsResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ITransportStationFullRs>(
            'TransportStationFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
