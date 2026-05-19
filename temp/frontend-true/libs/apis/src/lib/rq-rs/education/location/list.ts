import { IEducationLocationDTO, IPaginationDTO } from '../../../dtos';

export interface IEducationLocationListRs {
    readonly list: IEducationLocationDTO[];
    readonly pagination: IPaginationDTO;
}
