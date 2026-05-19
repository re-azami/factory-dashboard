import { ILoadDraftInDTO } from '../../../../dtos';

export interface ILoadFlowInExitRq {
    readonly description: string;
}

export interface ILoadFlowInExitRs extends ILoadDraftInDTO {}
