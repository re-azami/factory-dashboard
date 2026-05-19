import { IPaginationDTO, IUserPersonDTO } from '../../../dtos';

export interface IUserPersonListRs {
    readonly list: IUserPersonDTO[];
    readonly pagination: IPaginationDTO;
}
