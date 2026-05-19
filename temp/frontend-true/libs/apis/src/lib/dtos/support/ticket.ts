import { App, SupportRequest, SupportTicket } from '@lib/shared';

export interface ISupportTicketAttachmentDTO {
    readonly file: string;
    readonly path: string;
    readonly mime: string;
    readonly size: number;
}

export interface ISupportTicketDTO {
    readonly id: string;
    readonly user: { readonly id: string; readonly name: string };
    readonly date: { readonly create: Date; readonly update: Date };
    readonly app: App;
    readonly type: SupportRequest;
    readonly title: string;
    readonly ticket: string;
    readonly attachments: ISupportTicketAttachmentDTO[];
    readonly status: SupportTicket;
    readonly replies: {
        readonly id: string;
        readonly from: 'USER' | 'SUPPORT';
        readonly date: Date;
        readonly reply: string;
        readonly attachments: ISupportTicketAttachmentDTO[];
    }[];
}

export interface ISupportTicketListDTO
    extends Pick<ISupportTicketDTO, 'id' | 'user' | 'date' | 'app' | 'type' | 'title' | 'ticket' | 'status'> {}
