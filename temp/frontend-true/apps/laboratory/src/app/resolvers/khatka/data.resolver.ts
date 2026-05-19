import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILaboratoryKhatkaDataRs } from '@lib/apis';

export const LaboratoryKhatkaDataResolver: ResolveFn<ILaboratoryKhatkaDataRs> = (): Promise<ILaboratoryKhatkaDataRs> => {
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryKhatkaDataRs>((resolve) => {
        apiService.request<ILaboratoryKhatkaDataRs>(
            'LaboratoryKhatkaData',
            { silent: true },
            (response) => resolve(response),
            () => resolve({ party: [], shipment: [] }),
        );
    });
};
