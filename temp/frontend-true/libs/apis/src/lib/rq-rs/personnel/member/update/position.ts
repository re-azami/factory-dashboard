import { IPersonnelMemberDTO } from '../../../../dtos';

export interface IPersonnelMemberUpdatePositionRq {
    readonly position: string;
    readonly description: string;
}

export interface IPersonnelMemberUpdatePositionRs extends IPersonnelMemberDTO {}
