import { IEducationStudyDTO, IPaginationDTO } from '../../../dtos';

export interface IEducationStudyDoneRs {
    readonly list: IEducationStudyDTO[];
    readonly pagination: IPaginationDTO;
}
