import { IPaginationDTO, ISupportTicketListDTO } from '../../../dtos';

export interface ISupportTicketListRs {
    readonly list: ISupportTicketListDTO[];
    readonly pagination: IPaginationDTO;
}
