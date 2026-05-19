import { IEducationCourseDTO } from '../../../dtos';

export interface IEducationReportCourseRs {
    readonly course: IEducationCourseDTO;
    readonly first: Date;
    readonly last: Date;
    readonly institutes: {
        readonly id: string;
        readonly title: string;
        readonly study: number;
    }[];
    readonly mentors: {
        readonly id: string;
        readonly title: string;
        readonly study: number;
    }[];
}
