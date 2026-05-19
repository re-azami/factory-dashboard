import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, IEducationStudyDTO, IEducationStudyInfoRs } from '@lib/apis';

export const EducationStudyResolver: ResolveFn<IEducationStudyDTO> = (route): Promise<IEducationStudyDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<IEducationStudyDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<IEducationStudyInfoRs>(
            'EducationStudyInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/dashboard']);
                reject();
            },
        );
    });
};
