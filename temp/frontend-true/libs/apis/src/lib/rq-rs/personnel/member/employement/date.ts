import { IPersonnelMemberDTO } from '../../../../dtos';

export interface IPersonnelMemberEmployementDateRq {
    readonly employementDate: Date;
    readonly description: string;
}

export interface IPersonnelMemberEmployementDateRs extends IPersonnelMemberDTO {}
