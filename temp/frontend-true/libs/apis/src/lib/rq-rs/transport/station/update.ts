import { ITransportStationDTO } from '../../../dtos';

export interface ITransportStationUpdateRq {
    readonly title: string;
    readonly description: string;
}

export interface ITransportStationUpdateRs extends ITransportStationDTO {}
