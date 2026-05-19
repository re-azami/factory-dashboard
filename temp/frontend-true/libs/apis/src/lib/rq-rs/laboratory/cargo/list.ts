import { ILaboratoryCargoDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryCargoListRs {
    readonly list: ILaboratoryCargoDTO[];
    readonly pagination: IPaginationDTO;
}
