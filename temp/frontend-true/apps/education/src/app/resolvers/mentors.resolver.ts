import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IEducationMentorFullRs, IOptionDTO } from '@lib/apis';

export const EducationMentorsResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<IEducationMentorFullRs>(
            'EducationMentorFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
