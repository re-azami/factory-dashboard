import { ISupportTicketDTO } from '../../../dtos';

export interface ISupportTicketReplyRq {
    readonly reply: string;
    readonly attachments: {
        readonly file: string;
        readonly path: string;
        readonly mime: string;
        readonly size: number;
    }[];
}

export interface ISupportTicketReplyRs extends ISupportTicketDTO {}
