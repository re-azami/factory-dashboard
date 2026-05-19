import { IEducationCourseDTO } from '../../../dtos';

export interface IEducationCourseUpdateRq {
    readonly title: string;
    readonly description: string;
}

export interface IEducationCourseUpdateRs extends IEducationCourseDTO {}
