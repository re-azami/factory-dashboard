import { ITransportStationCenterDTO } from '../../../dtos';

export interface ITransportStationCalculateRq {
    readonly locations: string[];
    readonly count: number;
}

export interface ITransportStationCalculateRs extends Array<ITransportStationCenterDTO> {}
