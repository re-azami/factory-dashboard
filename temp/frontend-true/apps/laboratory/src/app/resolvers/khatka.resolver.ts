import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratoryKhatkaDTO, ILaboratoryKhatkaInfoRs } from '@lib/apis';

export const LaboratoryKhatkaResolver: ResolveFn<ILaboratoryKhatkaDTO> = (route): Promise<ILaboratoryKhatkaDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryKhatkaDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratoryKhatkaInfoRs>(
            'LaboratoryKhatkaInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/khatka']);
                reject();
            },
        );
    });
};
