import { IEducationMentorDTO } from '../../../dtos';

export interface IEducationMentorUpdateRq {
    readonly name: { readonly first: string; readonly last: string };
    readonly mobile: string;
    readonly nationalCode: string;
    readonly introducer: string;
}

export interface IEducationMentorUpdateRs extends IEducationMentorDTO {}
