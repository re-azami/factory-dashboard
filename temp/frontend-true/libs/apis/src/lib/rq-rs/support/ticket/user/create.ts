import { App, SupportRequest } from '@lib/shared';

import { ISupportTicketDTO } from '../../../../dtos';

export interface ISupportTicketUserCreateRq {
    readonly app: App;
    readonly type: SupportRequest;
    readonly title: string;
    readonly ticket: string;
    readonly attachments: {
        readonly file: string;
        readonly path: string;
        readonly mime: string;
        readonly size: number;
    }[];
}

export interface ISupportTicketUserCreateRs extends ISupportTicketDTO {}
