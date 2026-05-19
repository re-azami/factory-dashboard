import { ITransportRouteDTO } from '../../../dtos';

export interface ITransportRouteReverseRq {
    readonly pathIndex: number;
    readonly config: {
        readonly stop: number;
        readonly percent: number;
    };
}

export interface ITransportRouteReverseRs extends ITransportRouteDTO {}
