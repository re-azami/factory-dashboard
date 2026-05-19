import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IOptionDTO, IUserPersonFullRs } from '@lib/apis';

export const AdminPersonsResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<IUserPersonFullRs>(
            'UserPersonFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
