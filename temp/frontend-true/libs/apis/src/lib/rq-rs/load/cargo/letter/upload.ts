import { ILoadCargoDTO } from '../../../../dtos';

export interface ILoadCargoLetterUploadRq {
    readonly path: string;
    readonly mime: string;
    readonly size: number;
}

export interface ILoadCargoLetterUploadRs extends ILoadCargoDTO {}
