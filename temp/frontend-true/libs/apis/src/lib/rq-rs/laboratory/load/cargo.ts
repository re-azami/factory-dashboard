import { ILaboratoryLoadCargoDTO, IPaginationDTO } from '../../../dtos';

export interface ILaboratoryLoadCargoRs {
    readonly list: ILaboratoryLoadCargoDTO[];
    readonly pagination: IPaginationDTO;
}
