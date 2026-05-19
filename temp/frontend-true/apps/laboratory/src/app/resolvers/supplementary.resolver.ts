import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratorySupplementaryDTO, ILaboratorySupplementaryInfoRs } from '@lib/apis';

export const LaboratorySupplementaryResolver: ResolveFn<ILaboratorySupplementaryDTO> = (
    route,
): Promise<ILaboratorySupplementaryDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratorySupplementaryDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratorySupplementaryInfoRs>(
            'LaboratorySupplementaryInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/supplementary']);
                reject();
            },
        );
    });
};
