import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILoadActiveTransporterRs, IOptionDTO } from '@lib/apis';

export const LoadActiveTransporterResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ILoadActiveTransporterRs>(
            'LoadActiveTransporter',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
