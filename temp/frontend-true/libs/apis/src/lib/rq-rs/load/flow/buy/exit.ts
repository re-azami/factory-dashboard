import { ILoadDraftBuyDTO } from '../../../../dtos';

export interface ILoadFlowBuyExitRq {
    readonly description: string;
}

export interface ILoadFlowBuyExitRs extends ILoadDraftBuyDTO {}
