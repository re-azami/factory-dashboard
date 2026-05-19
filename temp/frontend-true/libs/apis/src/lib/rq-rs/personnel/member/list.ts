import { IPaginationDTO, IPersonnelMemberDTO } from '../../../dtos';

export interface IPersonnelMemberListRs {
    readonly list: IPersonnelMemberDTO[];
    readonly pagination: IPaginationDTO;
}
