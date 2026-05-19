import { ILogExceptionDTO, IPaginationDTO } from '../../dtos';

export interface ILogExceptionRs {
    readonly list: ILogExceptionDTO[];
    readonly pagination: IPaginationDTO;
}
