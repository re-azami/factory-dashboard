import { ILoadCargoDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadCargoListRs {
    readonly list: ILoadCargoDTO[];
    readonly pagination: IPaginationDTO;
}
