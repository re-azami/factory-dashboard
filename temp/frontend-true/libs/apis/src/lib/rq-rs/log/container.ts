import { ILogContainerDTO, IPaginationDTO } from '../../dtos';

export interface ILogContainerRs {
    readonly list: ILogContainerDTO[];
    readonly pagination: IPaginationDTO;
}
