import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ISharedPersonnelMemberDTO, ISharedPersonnelMemberInfoRs } from '@lib/apis';

export const SharedPersonnelInfoResolver: ResolveFn<ISharedPersonnelMemberDTO> = (
    route,
): Promise<ISharedPersonnelMemberDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ISharedPersonnelMemberDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('PARTICIPANTID') || '';

        apiService.request<ISharedPersonnelMemberInfoRs>(
            'SharedPersonnelMemberInfo',
            { ids: { ID }, silent: true, loading: false },
            (response) => resolve(response),
            () => {
                router.navigate(['/dashboard']);
                reject();
            },
        );
    });
};
