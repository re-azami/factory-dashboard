import { IEducationStudyDTO } from '../../../dtos';

export interface IEducationParticipantCreateRq {
    readonly participants: string[];
}

export interface IEducationParticipantCreateRs extends IEducationStudyDTO {}
