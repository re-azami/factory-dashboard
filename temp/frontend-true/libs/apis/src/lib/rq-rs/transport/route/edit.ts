import { ITransportRouteDTO } from '../../../dtos';

export interface ITransportRouteEditRq {
    readonly pathIndex: number;
    readonly parking: string;
    readonly vehicle: string;
    readonly origin: {
        readonly center: number | null;
        readonly latitude: number;
        readonly longitude: number;
    };
    readonly destination: {
        readonly center: number | null;
        readonly latitude: number;
        readonly longitude: number;
    };
    readonly path: number[];
    readonly config: {
        readonly stop: number;
        readonly percent: number;
    };
}

export interface ITransportRouteEditRs extends ITransportRouteDTO {}
