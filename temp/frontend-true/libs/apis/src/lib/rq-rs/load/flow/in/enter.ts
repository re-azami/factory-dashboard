import { ILoadDraftInDTO } from '../../../../dtos';

export interface ILoadFlowInEnterRq {
    readonly description: string;
}

export interface ILoadFlowInEnterRs extends ILoadDraftInDTO {}
