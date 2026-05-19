import { INgxHelperCoordinates } from '@webilix/ngx-helper';

import { ITransportParkingVehicleDTO } from '@lib/apis';
import { TransportPassenger } from '@lib/shared';

export interface IRouteVehicle extends ITransportParkingVehicleDTO {
    readonly parking: {
        readonly id: string;
        readonly title: string;
        readonly latitude: number;
        readonly longitude: number;
    };
}

export interface IRouteConfig {
    readonly vehicles: string[];
    readonly time: {
        readonly route: number;
        readonly stop: number;
        readonly search: number;
    };
    readonly search: {
        readonly type: 'PERCENT' | 'PASSENGER';
        readonly percent: number;
        readonly passengers: TransportPassenger[];
    };
    readonly count: {
        readonly capacity: number;
        readonly passenger: number;
    };
}

export interface IRouteBoundary extends INgxHelperCoordinates {
    center?: number;
    esmiran?: boolean;
}
