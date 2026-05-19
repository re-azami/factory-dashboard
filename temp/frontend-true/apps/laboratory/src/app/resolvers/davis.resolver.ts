import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratoryDavisDTO, ILaboratoryDavisInfoRs } from '@lib/apis';

export const LaboratoryDavisResolver: ResolveFn<ILaboratoryDavisDTO> = (route): Promise<ILaboratoryDavisDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryDavisDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratoryDavisInfoRs>(
            'LaboratoryDavisInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/davis']);
                reject();
            },
        );
    });
};
