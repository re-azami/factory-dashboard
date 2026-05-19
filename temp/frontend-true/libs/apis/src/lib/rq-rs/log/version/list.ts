import { ILogVersionDTO, IPaginationDTO } from '../../../dtos';

export interface ILogVersionListRs {
    readonly list: ILogVersionDTO[];
    readonly pagination: IPaginationDTO;
}
