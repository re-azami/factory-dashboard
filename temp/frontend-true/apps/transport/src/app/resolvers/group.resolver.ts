import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ITransportGroupDTO, ITransportGroupInfoRs } from '@lib/apis';

export const TransportGroupResolver: ResolveFn<ITransportGroupDTO> = (route): Promise<ITransportGroupDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ITransportGroupDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('groupId') || '';
        apiService.request<ITransportGroupInfoRs>(
            'TransportGroupInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/dashboard']);
                reject();
            },
        );
    });
};
