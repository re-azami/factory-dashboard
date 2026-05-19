import { ITransportStationDTO } from '../../../dtos';

export interface ITransportStationCreateRq {
    readonly title: string;
    readonly description: string;
    readonly centers: {
        readonly index: number;
        readonly color: string;
        readonly latitude: number;
        readonly longitude: number;
    }[];
    readonly locations: {
        readonly center: number;
        readonly location: string;
        readonly time: number;
        readonly distance: number;
    }[];
}

export interface ITransportStationCreateRs extends ITransportStationDTO {}
