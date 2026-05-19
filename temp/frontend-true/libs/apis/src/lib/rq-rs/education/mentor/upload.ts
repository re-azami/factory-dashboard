import { IEducationMentorDTO } from '../../../dtos';

export interface IEducationMentorUploadRq {
    readonly cv: string;
}

export interface IEducationMentorUploadRs extends IEducationMentorDTO {}
