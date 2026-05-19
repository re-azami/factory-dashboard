import { IEducationStudyDTO, IPaginationDTO } from '../../../dtos';

export interface IEducationStudyCanceledRs {
    readonly list: IEducationStudyDTO[];
    readonly pagination: IPaginationDTO;
}
