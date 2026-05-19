import { IPersonnelMemberDTO } from '../../../../dtos';

export interface IPersonnelMemberUpdateDepartmentRq {
    readonly department: string;
    readonly description: string;
}

export interface IPersonnelMemberUpdateDepartmentRs extends IPersonnelMemberDTO {}
