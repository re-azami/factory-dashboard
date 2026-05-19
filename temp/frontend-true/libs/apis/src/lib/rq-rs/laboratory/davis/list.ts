import { ILaboratoryDavisDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryDavisListRs {
    readonly list: ILaboratoryDavisDTO[];
    readonly pagination: IPaginationDTO;
}
