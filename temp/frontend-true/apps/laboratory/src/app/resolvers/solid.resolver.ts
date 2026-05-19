import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILaboratorySolidDTO, ILaboratorySolidInfoRs } from '@lib/apis';

export const LaboratorySolidResolver: ResolveFn<ILaboratorySolidDTO> = (route): Promise<ILaboratorySolidDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILaboratorySolidDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILaboratorySolidInfoRs>(
            'LaboratorySolidInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/solid']);
                reject();
            },
        );
    });
};
