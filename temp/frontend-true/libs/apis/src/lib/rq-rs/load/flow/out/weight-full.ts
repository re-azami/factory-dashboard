import { ILoadDraftOutDTO } from '../../../../dtos';

export interface ILoadFlowOutWeightFullRq {
    readonly full: number;
    readonly description: string;
}

export interface ILoadFlowOutWeightFullRs extends ILoadDraftOutDTO {}
