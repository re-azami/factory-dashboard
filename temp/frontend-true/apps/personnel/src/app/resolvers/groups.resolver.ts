import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IPersonnelGroupFullRs } from '@lib/apis';

export const PersonnelGroupsResolver: ResolveFn<IPersonnelGroupFullRs> = (): Promise<IPersonnelGroupFullRs> => {
    const apiService = inject(ApiService);

    return new Promise<IPersonnelGroupFullRs>((resolve) => {
        apiService.request<IPersonnelGroupFullRs>(
            'PersonnelGroupFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve({ education: [], department: [], position: [] }),
        );
    });
};
