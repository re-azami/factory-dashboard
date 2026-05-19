import { ITransportRouteDTO } from '../../../dtos';

export interface ITransportRouteCreateRq {
    readonly title: string;
    readonly description: string;
    readonly station: string;
    readonly paths: {
        readonly path: number;
        readonly color: string;
        readonly time: number;
        readonly passenger: number;
        readonly parking: string;
        readonly vehicle: string;
    }[];
    readonly centers: {
        readonly path: number;
        readonly center: number;
        readonly color: string;
        readonly timeCenter: number;
        readonly timeTotal: number;
        readonly passengerCenter: number;
        readonly passengerTotal: number;
        readonly latitude: number;
        readonly longitude: number;
    }[];
    readonly locations: {
        readonly path: number;
        readonly center: number;
        readonly location: string;
        readonly time: number;
        readonly distance: number;
    }[];
    readonly passengers: string[];
    readonly destination: {
        readonly latitude: number;
        readonly longitude: number;
    };
    readonly config: {
        readonly stop: number;
        readonly percent: number | null;
    };
}

export interface ITransportRouteCreateRs extends ITransportRouteDTO {}
