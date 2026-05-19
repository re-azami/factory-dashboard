import { IEducationInstituteDTO, IPaginationDTO } from '../../../dtos';

export interface IEducationInstituteListRs {
    readonly list: IEducationInstituteDTO[];
    readonly pagination: IPaginationDTO;
}
