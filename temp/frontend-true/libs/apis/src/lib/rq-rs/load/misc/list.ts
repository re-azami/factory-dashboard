import { ILoadMiscDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadMiscListRs {
    readonly list: ILoadMiscDTO[];
    readonly pagination: IPaginationDTO;
}
