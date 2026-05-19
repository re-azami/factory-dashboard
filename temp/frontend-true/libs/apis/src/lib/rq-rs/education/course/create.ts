import { IEducationCourseDTO } from '../../../dtos';

export interface IEducationCourseCreateRq {
    readonly code: string;
    readonly title: string;
    readonly description: string;
}

export interface IEducationCourseCreateRs extends IEducationCourseDTO {}
