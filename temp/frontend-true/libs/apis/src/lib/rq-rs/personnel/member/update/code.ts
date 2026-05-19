import { IPersonnelMemberDTO } from '../../../../dtos';

export interface IPersonnelMemberUpdateCodeRq {
    readonly code: string;
    readonly description: string;
}

export interface IPersonnelMemberUpdateCodeRs extends IPersonnelMemberDTO {}
