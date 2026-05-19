import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IOptionDTO, ITransportGroupFullRs } from '@lib/apis';

export const TransportGroupsResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ITransportGroupFullRs>(
            'TransportGroupFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
