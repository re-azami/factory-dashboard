import { IPersonnelMemberDTO } from '../../../dtos';

export interface IPersonnelMemberImageRq {
    readonly image: string | null;
}

export interface IPersonnelMemberImageRs extends IPersonnelMemberDTO {}
