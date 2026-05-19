import { IPersonnelMemberDTO } from '../../../../dtos';

export interface IPersonnelMemberUpdateEducationRq {
    readonly education: string;
    readonly fieldOfStudy: string;
    readonly description: string;
}

export interface IPersonnelMemberUpdateEducationRs extends IPersonnelMemberDTO {}
