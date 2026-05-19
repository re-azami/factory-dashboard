import { ILoadDraftDTO } from '../../../../dtos';

export interface ILoadDraftUpdateFinishRq {
    readonly finish: Date;
    readonly description: string;
}

export interface ILoadDraftUpdateFinishRs extends ILoadDraftDTO {}
