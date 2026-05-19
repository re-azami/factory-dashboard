import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IEducationInstituteFullRs, IOptionDTO } from '@lib/apis';

export const EducationInstitutesResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<IEducationInstituteFullRs>(
            'EducationInstituteFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
