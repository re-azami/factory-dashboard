import { ILoadDraftOutDTO } from '../../../../dtos';

export interface ILoadFlowOutExitRq {
    readonly bitaBill: string;
    readonly description: string;
}

export interface ILoadFlowOutExitRs extends ILoadDraftOutDTO {}
