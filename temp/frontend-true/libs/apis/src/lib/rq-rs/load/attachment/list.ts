import { ILoadAttachmentDTO, IPaginationDTO } from '../../../dtos';

export interface ILoadAttachmentListRs {
    readonly list: ILoadAttachmentDTO[];
    readonly pagination: IPaginationDTO;
}
