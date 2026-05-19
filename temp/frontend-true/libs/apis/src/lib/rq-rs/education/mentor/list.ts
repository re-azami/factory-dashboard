import { IEducationMentorDTO, IPaginationDTO } from '../../../dtos';

export interface IEducationMentorListRs {
    readonly list: IEducationMentorDTO[];
    readonly pagination: IPaginationDTO;
}
