import { Upload } from '@lib/shared';

export interface IUploadRq {
    readonly type: Upload;
}

export interface IUploadRs {
    readonly path: string;
    readonly mime: string;
    readonly size: number;
}
