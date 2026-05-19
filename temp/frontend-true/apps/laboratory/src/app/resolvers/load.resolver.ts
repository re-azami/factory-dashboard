import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratoryLoadDTO, ILaboratoryLoadInfoRs } from '@lib/apis';

export const LaboratoryLoadResolver: ResolveFn<ILaboratoryLoadDTO> = (route): Promise<ILaboratoryLoadDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryLoadDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratoryLoadInfoRs>(
            'LaboratoryLoadInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/load']);
                reject();
            },
        );
    });
};
