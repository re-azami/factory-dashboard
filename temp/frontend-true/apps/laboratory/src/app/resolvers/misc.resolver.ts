import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratoryMiscDTO, ILaboratoryMiscInfoRs } from '@lib/apis';

export const LaboratoryMiscResolver: ResolveFn<ILaboratoryMiscDTO> = (route): Promise<ILaboratoryMiscDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryMiscDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratoryMiscInfoRs>(
            'LaboratoryMiscInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/misc']);
                reject();
            },
        );
    });
};
