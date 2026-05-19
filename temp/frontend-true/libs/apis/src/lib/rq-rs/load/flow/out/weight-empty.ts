import { ILoadDraftOutDTO } from '../../../../dtos';

export interface ILoadFlowOutWeightEmptyRq {
    readonly empty: number;
    readonly description: string;
}

export interface ILoadFlowOutWeightEmptyRs extends ILoadDraftOutDTO {}
