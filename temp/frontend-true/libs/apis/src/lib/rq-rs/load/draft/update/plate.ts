import { ILoadDraftDTO } from '../../../../dtos';

export interface ILoadDraftUpdatePlateRq {
    readonly plate: string;
    readonly description: string;
}

export interface ILoadDraftUpdatePlateRs extends ILoadDraftDTO {}
