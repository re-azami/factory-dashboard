import { LoadAttachment } from '@lib/shared';

import { ILoadAttachmentDTO } from '../../../dtos';

export interface ILoadAttachmentCreateRq {
    readonly attachment: LoadAttachment;
    readonly data: string;
    readonly title: string;
    readonly code: string;
    readonly file: {
        readonly path: string;
        readonly mime: string;
        readonly size: number;
    };
    readonly description: string;
}

export interface ILoadAttachmentCreateRs extends ILoadAttachmentDTO {}
