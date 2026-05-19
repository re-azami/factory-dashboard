import { ILaboratoryMiscDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryMiscListRs {
    readonly list: ILaboratoryMiscDTO[];
    readonly pagination: IPaginationDTO;
}
