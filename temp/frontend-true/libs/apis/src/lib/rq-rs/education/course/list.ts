import { IEducationCourseDTO, IPaginationDTO } from '../../../dtos';

export interface IEducationCourseListRs {
    readonly list: IEducationCourseDTO[];
    readonly pagination: IPaginationDTO;
}
