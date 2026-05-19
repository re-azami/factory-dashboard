import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IOptionDTO, ITransportParkingFullRs } from '@lib/apis';

export const TransportParkingsResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ITransportParkingFullRs>(
            'TransportParkingFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
