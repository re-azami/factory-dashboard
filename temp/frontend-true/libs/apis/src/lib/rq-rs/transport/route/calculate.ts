import { TransportPassenger } from '@lib/shared';

import { ITransportRoutePathDTO } from '../../../dtos';

export interface ITransportRouteCalculateRq {
    readonly station: string;
    readonly vehicles: {
        readonly parking: string;
        readonly vehicle: string;
    }[];
    readonly time: {
        readonly route: number;
        readonly stop: number;
        readonly search: number;
    };
    readonly search: 'PERCENT' | 'PASSENGER';
    readonly percent: number;
    readonly passengers: TransportPassenger[];
    readonly destination: {
        readonly latitude: number;
        readonly longitude: number;
    };
}

export interface ITransportRouteCalculateRs extends Array<ITransportRoutePathDTO> {}
