import { IAlertDTO, IPaginationDTO } from '../../../dtos';

export interface IUserAlertListRs {
    readonly list: IAlertDTO[];
    readonly pagination: IPaginationDTO;
}
