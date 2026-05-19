import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IKitchenActiveGroupRs, IOptionDTO } from '@lib/apis';

export const KitchenActiveGroupResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<IKitchenActiveGroupRs>(
            'KitchenActiveGroup',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
