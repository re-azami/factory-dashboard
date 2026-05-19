import { IPersonnelMemberDTO } from '../personnel/member';

export interface ISharedPersonnelMemberDTO
    extends Pick<IPersonnelMemberDTO, 'id' | 'name' | 'code' | 'department' | 'position'> {}
