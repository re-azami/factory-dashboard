import { ILoadDraftBuyDTO } from '../../../../dtos';

export interface ILoadFlowBuyWeightFullRq {
    readonly full: number;
    readonly description: string;
}

export interface ILoadFlowBuyWeightFullRs extends ILoadDraftBuyDTO {}
