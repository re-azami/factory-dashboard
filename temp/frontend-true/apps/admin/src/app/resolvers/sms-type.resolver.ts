import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILogSmsTypeRs, IOptionDTO } from '@lib/apis';

export const AdminSmsTypeResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<ILogSmsTypeRs>(
            'LogSmsType',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
