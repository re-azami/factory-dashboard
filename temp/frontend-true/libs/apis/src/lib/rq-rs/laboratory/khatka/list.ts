import { ILaboratoryKhatkaDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryKhatkaListRs {
    readonly list: ILaboratoryKhatkaDTO[];
    readonly pagination: IPaginationDTO;
}
