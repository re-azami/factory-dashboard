import { ILoadDraftDTO } from '../../../../dtos';

export interface ILoadDraftUpdateWeightRq {
    readonly empty: number | null;
    readonly full: number | null;
    readonly description: string;
}

export interface ILoadDraftUpdateWeightRs extends ILoadDraftDTO {}
