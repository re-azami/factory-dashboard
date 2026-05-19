import { ILoadTransporterDTO } from '../../../dtos';

export interface ILoadTransporterUpdateRq {
    readonly title: string;
    readonly code: string;
}

export interface ILoadTransporterUpdateRs extends ILoadTransporterDTO {}
