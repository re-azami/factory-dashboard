import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationStudyParticipantRq {
    readonly participant: number;
}

export interface IEducationStudyParticipantRs extends IEducationStudyDTO {}
