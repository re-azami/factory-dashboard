import { ILoadTransporterDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadTransporterListRs {
    readonly list: ILoadTransporterDTO[];
    readonly pagination: IPaginationDTO;
}
