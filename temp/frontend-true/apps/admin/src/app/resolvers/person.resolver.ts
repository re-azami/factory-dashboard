import { inject } from '@angular/core';
import { Router, ResolveFn } from '@angular/router';

import { ApiService, IUserPersonDTO, IUserPersonInfoRs } from '@lib/apis';

export const AdminPersonResolver: ResolveFn<IUserPersonDTO> = (route): Promise<IUserPersonDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<IUserPersonDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('personId') || '';
        apiService.request<IUserPersonInfoRs>(
            'UserPersonInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/person']);
                reject();
            },
        );
    });
};
