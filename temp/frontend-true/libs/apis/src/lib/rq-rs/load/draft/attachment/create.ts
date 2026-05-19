import { ILoadDraftDTO } from '../../../../dtos';

export interface ILoadDraftAttachmentCreateRq {
    readonly title: string;
    readonly file: {
        readonly path: string;
        readonly mime: string;
        readonly size: number;
    };
}

export interface ILoadDraftAttachmentCreateRs extends ILoadDraftDTO {}
