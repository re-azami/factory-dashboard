import { IPaginationDTO, ISupportNotificationDTO } from '../../../dtos';

export interface ISupportNotificationListRs {
    readonly list: ISupportNotificationDTO[];
    readonly pagination: IPaginationDTO;
}
