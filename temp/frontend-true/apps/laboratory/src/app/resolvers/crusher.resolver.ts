import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratoryCrusherDTO, ILaboratoryCrusherInfoRs } from '@lib/apis';

export const LaboratoryCrusherResolver: ResolveFn<ILaboratoryCrusherDTO> = (route): Promise<ILaboratoryCrusherDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryCrusherDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratoryCrusherInfoRs>(
            'LaboratoryCrusherInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/crusher']);
                reject();
            },
        );
    });
};
