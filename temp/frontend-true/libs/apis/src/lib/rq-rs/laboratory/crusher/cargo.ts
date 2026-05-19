import { ILaboratoryCrusherCargoDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryCrusherCargoRs {
    readonly list: ILaboratoryCrusherCargoDTO[];
    readonly pagination: IPaginationDTO;
}
