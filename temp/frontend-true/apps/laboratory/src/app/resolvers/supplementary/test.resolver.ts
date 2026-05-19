import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratorySupplementaryTestDTO, ILaboratorySupplementaryTestInfoRs } from '@lib/apis';

export const LaboratorySupplementaryTestResolver: ResolveFn<ILaboratorySupplementaryTestDTO> = (
    route,
): Promise<ILaboratorySupplementaryTestDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratorySupplementaryTestDTO>((resolve, reject) => {
        const SUPPLEMENTARYID: string = route.paramMap.get('ID') || '';
        const ID: string = route.paramMap.get('TESTID') || '';

        apiService.request<ILaboratorySupplementaryTestInfoRs>(
            'LaboratorySupplementaryTestInfo',
            { ids: { SUPPLEMENTARYID, ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/supplementary']);
                reject();
            },
        );
    });
};
