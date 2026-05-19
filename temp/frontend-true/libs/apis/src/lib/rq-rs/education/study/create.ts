import { EducationDate, EducationEducator, EducationExam, EducationStudy } from '@lib/shared';

import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyCreateRq {
    readonly type: EducationStudy;
    readonly course: string;
    readonly applicant: string;
    readonly department: string[];
    readonly educator: EducationEducator;
    readonly educatorId: string;
    readonly expense: number;
    readonly participant: number;
    readonly exam: EducationExam[];
    readonly certificate: string;
    readonly description: string;
    readonly dates: {
        readonly date: Date;
        readonly start: string;
        readonly end: string;
        readonly type: EducationDate;
        readonly location: string | null;
    }[];
}

export interface IEducationStudyCreateRs extends IEducationStudyDTO {}
