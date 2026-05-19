import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ILoadTransporterDTO, ILoadTransporterInfoRs } from '@lib/apis';

export const LoadTransporterResolver: ResolveFn<ILoadTransporterDTO> = (route): Promise<ILoadTransporterDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ILoadTransporterDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<ILoadTransporterInfoRs>(
            'LoadTransporterInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/transporter']);
                reject();
            },
        );
    });
};
