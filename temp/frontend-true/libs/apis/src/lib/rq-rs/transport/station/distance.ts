import { ITransportStationDTO } from '../../../dtos';

export interface ITransportStationDistanceRq {
    readonly centers: {
        readonly index: number;
        readonly color: string;
        readonly latitude: number;
        readonly longitude: number;
    }[];
    readonly locations: {
        readonly center: number;
        readonly location: string;
    }[];
}

export interface ITransportStationDistanceRs extends ITransportStationDTO {}
