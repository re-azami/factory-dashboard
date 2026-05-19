import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyDepartmentRq {
    readonly department: string[];
}

export interface IEducationStudyDepartmentRs extends IEducationStudyDTO {}
