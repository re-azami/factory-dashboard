import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILoadActiveOwnerRs, IOptionDTO } from '@lib/apis';

export const LoadActiveOwnerResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ILoadActiveOwnerRs>(
            'LoadActiveOwner',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
