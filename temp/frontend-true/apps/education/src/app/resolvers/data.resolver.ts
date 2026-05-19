import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, IEducationStudyDataRs } from '@lib/apis';
import { UserService } from '@lib/providers';

export const EducationDataResolver: ResolveFn<IEducationStudyDataRs> = (): Promise<IEducationStudyDataRs> => {
    const apiService = inject(ApiService);
    const userService = inject(UserService);

    return new Promise<IEducationStudyDataRs>((resolve) => {
        const empty: IEducationStudyDataRs = {
            departments: [],
            personnels: [],
            courses: [],
            mentors: [],
            institutes: [],
            locations: [],
        };

        if (!userService.hasAccess({ access: 'EDUCATION_ROLE_STUDY' })) {
            resolve(empty);
            return;
        }

        apiService.request<IEducationStudyDataRs>(
            'EducationStudyData',
            { silent: true },
            (response) => resolve(response),
            () => resolve(empty),
        );
    });
};
