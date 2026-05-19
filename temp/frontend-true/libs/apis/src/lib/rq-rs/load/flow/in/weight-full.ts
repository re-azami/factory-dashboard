import { ILoadDraftInDTO } from '../../../../dtos';

export interface ILoadFlowInWeightFullRq {
    readonly empty: number | null;
    readonly full: number;
    readonly description: string;
}

export interface ILoadFlowInWeightFullRs extends ILoadDraftInDTO {}
