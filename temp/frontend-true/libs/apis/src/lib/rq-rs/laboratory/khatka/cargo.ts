import { ILaboratoryKhatkaCargoDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryKhatkaCargoRs {
    readonly list: ILaboratoryKhatkaCargoDTO[];
    readonly pagination: IPaginationDTO;
}
