import { IEducationInstituteDTO } from '../../../dtos';

export interface IEducationInstituteUpdateRq {
    readonly title: string;
    readonly ceo: { readonly name: string; readonly mobile: string };
    readonly introducer: { readonly name: string; readonly mobile: string };
}

export interface IEducationInstituteUpdateRs extends IEducationInstituteDTO {}
