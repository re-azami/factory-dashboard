import { IEducationCourseDTO } from '../../../dtos';

export interface IEducationCourseCodeRq {
    readonly code: string;
}

export interface IEducationCourseCodeRs extends IEducationCourseDTO {}
