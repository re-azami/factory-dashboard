import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IEducationCourseFullRs, IOptionDTO } from '@lib/apis';

export const EducationCoursesResolver: ResolveFn<IOptionDTO[]> = (): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        apiService.request<IEducationCourseFullRs>(
            'EducationCourseFull',
            { silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
