import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILoadActiveShipmentRs, IOptionDTO } from '@lib/apis';

export const LoadActiveShipmentResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ILoadActiveShipmentRs>(
            'LoadActiveShipment',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
