import { ILoadDraftInDTO } from '../../../../dtos';

export interface ILoadFlowInLoadingMineRq {
    readonly empty: number;
    readonly full: number;
    readonly description: string;
}

export interface ILoadFlowInLoadingMineRs extends ILoadDraftInDTO {}
