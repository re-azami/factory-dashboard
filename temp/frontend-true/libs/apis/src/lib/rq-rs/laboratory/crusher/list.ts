import { ILaboratoryCrusherDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryCrusherListRs {
    readonly list: ILaboratoryCrusherDTO[];
    readonly pagination: IPaginationDTO;
}
