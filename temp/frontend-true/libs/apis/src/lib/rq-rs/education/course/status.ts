import { IOkDTO } from '../../../dtos';

export interface IEducationCourseStatusRq {
    readonly active: boolean;
}

export interface IEducationCourseStatusRs extends IOkDTO {}
