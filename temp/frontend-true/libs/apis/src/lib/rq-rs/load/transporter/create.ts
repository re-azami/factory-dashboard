import { ILoadTransporterDTO } from '../../../dtos';

export interface ILoadTransporterCreateRq {
    readonly title: string;
    readonly code: string;
}

export interface ILoadTransporterCreateRs extends ILoadTransporterDTO {}
