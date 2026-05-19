import { ILaboratorySolidDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratorySolidListRs {
    readonly list: ILaboratorySolidDTO[];
    readonly pagination: IPaginationDTO;
}
