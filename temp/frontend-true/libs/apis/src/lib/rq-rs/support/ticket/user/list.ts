import { IPaginationDTO, ISupportTicketListDTO } from '../../../../dtos';

export interface ISupportTicketUserListRs {
    readonly list: ISupportTicketListDTO[];
    readonly pagination: IPaginationDTO;
}
