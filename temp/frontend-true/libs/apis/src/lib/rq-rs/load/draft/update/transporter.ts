import { ILoadDraftDTO } from '../../../../dtos';

export interface ILoadDraftUpdateTransporterRq {
    readonly transporter: string;
    readonly description: string;
}

export interface ILoadDraftUpdateTransporterRs extends ILoadDraftDTO {}
