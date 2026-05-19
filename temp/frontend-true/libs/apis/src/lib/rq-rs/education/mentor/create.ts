import { IEducationMentorDTO } from '../../../dtos';

export interface IEducationMentorCreateRq {
    readonly name: { readonly first: string; readonly last: string };
    readonly mobile: string;
    readonly nationalCode: string;
    readonly introducer: string;
    readonly cv: string;
}

export interface IEducationMentorCreateRs extends IEducationMentorDTO {}
