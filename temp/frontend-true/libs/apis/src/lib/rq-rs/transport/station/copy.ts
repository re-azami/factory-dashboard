import { ITransportStationDTO } from '../../../dtos';

export interface ITransportStationCopyRq {
    readonly title: string;
    readonly description: string;
}

export interface ITransportStationCopyRs extends ITransportStationDTO {}
