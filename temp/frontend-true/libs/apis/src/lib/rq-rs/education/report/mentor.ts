import { IEducationMentorDTO, IEducationStudyDTO } from '../../../dtos';

export interface IEducationReportMentorRs {
    readonly mentor: IEducationMentorDTO;
    readonly first: Date;
    readonly last: Date;
    readonly studies: IEducationStudyDTO[];
}
