import { IOkDTO } from '../../../dtos';

export interface IEducationMentorStatusRq {
    readonly active: boolean;
}

export interface IEducationMentorStatusRs extends IOkDTO {}
