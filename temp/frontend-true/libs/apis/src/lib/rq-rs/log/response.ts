import { ILogResponseDTO, IPaginationDTO } from '../../dtos';

export interface ILogResponseRs {
    readonly list: ILogResponseDTO[];
    readonly pagination: IPaginationDTO;
}
