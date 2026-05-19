import { ILaboratoryLoadDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryLoadListRs {
    readonly list: ILaboratoryLoadDTO[];
    readonly pagination: IPaginationDTO;
}
