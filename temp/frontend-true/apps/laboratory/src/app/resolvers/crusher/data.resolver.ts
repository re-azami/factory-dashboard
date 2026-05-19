import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILaboratoryCrusherDataRs } from '@lib/apis';

export const LaboratoryCrusherDataResolver: ResolveFn<ILaboratoryCrusherDataRs> = (): Promise<ILaboratoryCrusherDataRs> => {
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryCrusherDataRs>((resolve) => {
        apiService.request<ILaboratoryCrusherDataRs>(
            'LaboratoryCrusherData',
            { silent: true },
            (response) => resolve(response),
            () => resolve({ party: [], shipment: [] }),
        );
    });
};
