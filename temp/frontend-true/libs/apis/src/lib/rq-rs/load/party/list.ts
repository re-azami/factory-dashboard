import { ILoadPartyDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadPartyListPayload {
    query: string;
    page: number;
}

export interface ILoadPartyListRs {
    readonly list: ILoadPartyDTO[];
    readonly pagination: IPaginationDTO;
}
