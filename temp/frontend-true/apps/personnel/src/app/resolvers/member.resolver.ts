import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, IPersonnelMemberDTO, IPersonnelMemberInfoRs } from '@lib/apis';

export const PersonnelMemberResolver: ResolveFn<IPersonnelMemberDTO> = (route): Promise<IPersonnelMemberDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<IPersonnelMemberDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<IPersonnelMemberInfoRs>(
            'PersonnelMemberInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/member']);
                reject();
            },
        );
    });
};
