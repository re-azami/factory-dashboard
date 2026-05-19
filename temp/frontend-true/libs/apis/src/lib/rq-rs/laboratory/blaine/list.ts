import { ILaboratoryBlaineDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryBlaineListRs {
    readonly list: ILaboratoryBlaineDTO[];
    readonly pagination: IPaginationDTO;
}
