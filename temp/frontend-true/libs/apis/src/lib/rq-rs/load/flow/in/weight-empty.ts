import { ILoadDraftInDTO } from '../../../../dtos';

export interface ILoadFlowInWeightEmptyRq {
    readonly empty: number;
    readonly description: string;
}
export interface ILoadFlowInWeightEmptyRs extends ILoadDraftInDTO {}
