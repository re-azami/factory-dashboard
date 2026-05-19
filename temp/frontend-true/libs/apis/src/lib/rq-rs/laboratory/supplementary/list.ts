import { ILaboratorySupplementaryDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratorySupplementaryListRs {
    readonly list: ILaboratorySupplementaryDTO[];
    readonly pagination: IPaginationDTO;
}
