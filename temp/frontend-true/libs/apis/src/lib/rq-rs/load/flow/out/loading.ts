import { ILoadDraftOutDTO } from '../../../../dtos';

export interface ILoadFlowOutLoadingRq {
    readonly description: string;
}

export interface ILoadFlowOutLoadingRs extends ILoadDraftOutDTO {}
