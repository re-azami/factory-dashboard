import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILaboratoryActiveCargoRs, IOptionDTO } from '@lib/apis';

export const LaboratoryActiveCargoResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ILaboratoryActiveCargoRs>(
            'LaboratoryActiveCargo',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
