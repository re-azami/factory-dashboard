import { EducationStudy } from '@lib/shared';

import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyCourseRq {
    readonly type: EducationStudy;
    readonly course: string;
    readonly description: string;
}

export interface IEducationStudyCourseRs extends IEducationStudyDTO {}
