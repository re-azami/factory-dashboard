import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ISharedPersonnelMemberDTO, ISharedPersonnelMemberListRs } from '@lib/apis';

export const SharedPersonnelListResolver: ResolveFn<ISharedPersonnelMemberDTO[]> = (): Promise<
    ISharedPersonnelMemberDTO[]
> => {
    const apiService = inject(ApiService);

    return new Promise<ISharedPersonnelMemberDTO[]>((resolve) => {
        apiService.request<ISharedPersonnelMemberListRs>(
            'SharedPersonnelMemberList',
            { silent: true, loading: false },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
