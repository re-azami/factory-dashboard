import { ILoadDraftInDTO } from '../../../../dtos';

export interface ILoadFlowInDischargeRq {
    readonly description: string;
}

export interface ILoadFlowInDischargeRs extends ILoadDraftInDTO {}
