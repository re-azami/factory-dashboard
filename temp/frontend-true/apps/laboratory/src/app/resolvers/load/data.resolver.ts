import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILaboratoryLoadDataRs } from '@lib/apis';

export const LaboratoryLoadDataResolver: ResolveFn<ILaboratoryLoadDataRs> = (): Promise<ILaboratoryLoadDataRs> => {
    const apiService = inject(ApiService);

    return new Promise<ILaboratoryLoadDataRs>((resolve) => {
        apiService.request<ILaboratoryLoadDataRs>(
            'LaboratoryLoadData',
            { silent: true },
            (response) => resolve(response),
            () => resolve({ party: [], shipment: [] }),
        );
    });
};
