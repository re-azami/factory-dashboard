import { EducationDate, EducationExam } from '@lib/shared';

import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyUpdateRq {
    readonly applicant: string;
    readonly department: string[];
    readonly exam: EducationExam[];
    readonly certificate: boolean;
    readonly description: string;
    readonly dates: {
        readonly date: Date;
        readonly start: string;
        readonly end: string;
        readonly type: EducationDate;
        readonly location: string | null;
    }[];
}

export interface IEducationStudyUpdateRs extends IEducationStudyDTO {}
