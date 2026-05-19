import { ILoadDraftBuyDTO } from '../../../../dtos';

export interface ILoadFlowBuyWeightEmptyRq {
    readonly empty: number;
    readonly description: string;
}

export interface ILoadFlowBuyWeightEmptyRs extends ILoadDraftBuyDTO {}
