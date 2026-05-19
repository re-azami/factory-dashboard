import { ILoadDraftDTO } from '../../../../dtos';

export interface ILoadDraftUpdateCargoRq {
    readonly cargo: string;
    readonly description: string;
}

export interface ILoadDraftUpdateCargoRs extends ILoadDraftDTO {}
