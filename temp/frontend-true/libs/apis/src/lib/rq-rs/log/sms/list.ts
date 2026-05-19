import { ILogSmsDTO, IPaginationDTO } from '../../../dtos';

export interface ILogSmsListRs {
    readonly list: ILogSmsDTO[];
    readonly pagination: IPaginationDTO;
}
