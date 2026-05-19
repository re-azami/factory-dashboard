import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IOptionDTO, ITransportLocationFullRs } from '@lib/apis';

export const TransportLocationsResolver: ResolveFn<IOptionDTO[]> = (route): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        const group: string = route.paramMap.get('groupId') || '';
        apiService.request<ITransportLocationFullRs>(
            'TransportLocationFull',
            { params: { group }, silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
