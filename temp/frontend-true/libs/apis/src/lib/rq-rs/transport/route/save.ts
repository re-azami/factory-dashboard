import { ITransportRouteDTO } from '../../../dtos';

export interface ITransportRouteSaveRq {
    readonly title: string;
    readonly description: string;
    readonly station: string;
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

export interface ITransportRouteSaveRs extends ITransportRouteDTO {}
