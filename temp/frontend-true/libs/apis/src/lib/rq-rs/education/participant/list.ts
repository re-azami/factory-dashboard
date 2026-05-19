import { IEducationParticipantDTO, IEducationStudyDTO } from '../../../dtos';

export interface IEducationParticipantListRs {
    readonly study: IEducationStudyDTO;
    readonly list: IEducationParticipantDTO[];
}
