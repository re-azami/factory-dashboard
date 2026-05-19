import { EducationEducator } from '@lib/shared';

import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyEducatorRq {
    readonly educator: EducationEducator;
    readonly educatorId: string;
    readonly description: string;
}

export interface IEducationStudyEducatorRs extends IEducationStudyDTO {}
