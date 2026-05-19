import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratoryCargoDTO, ILaboratoryCargoInfoRs } from '@lib/apis';

export const LaboratoryCargoResolver: ResolveFn<ILaboratoryCargoDTO> = (route): Promise<ILaboratoryCargoDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryCargoDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratoryCargoInfoRs>(
            'LaboratoryCargoInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/cargo']);
                reject();
            },
        );
    });
};
