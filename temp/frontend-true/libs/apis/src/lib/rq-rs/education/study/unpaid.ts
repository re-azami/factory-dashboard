import { IEducationStudyDTO, IPaginationDTO } from '../../../dtos';

export interface IEducationStudyUnpaidRs {
    readonly list: IEducationStudyDTO[];
    readonly pagination: IPaginationDTO;
}
