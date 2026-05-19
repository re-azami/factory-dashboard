import { IPaginationDTO, IUserPersonDTO } from '../../../dtos';

export interface IUserAdminListRs {
    readonly list: IUserPersonDTO[];
    readonly pagination: IPaginationDTO;
}
