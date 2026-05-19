import { TransportPassenger, TransportVehicle } from '@lib/shared';

export interface ITransportRoutePassengerDTO {
    readonly id: string;
    readonly type: TransportPassenger;
    readonly code: string | null;
    readonly name: string;
}

export interface ITransportRouteLocationDTO {
    readonly id: string;
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly passengers: ITransportRoutePassengerDTO[];
    readonly time: number;
    readonly distance: number;
}

export interface ITransportRouteCenterDTO {
    readonly color: string;
    readonly time: {
        readonly center: number;
        readonly total: number;
    };
    readonly passenger: {
        readonly center: number;
        readonly total: number;
    };
    readonly latitude: number;
    readonly longitude: number;
    readonly locations: ITransportRouteLocationDTO[];
}

export interface ITransportRouteParkingDTO {
    readonly id: string;
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
}

export interface ITransportRouteVehicleDTO {
    readonly id: string;
    readonly type: TransportVehicle;
    readonly title: string;
    readonly capacity: number;
}

export interface ITransportRoutePathDTO {
    readonly color: string;
    readonly time: number;
    readonly passenger: number;
    readonly parking: ITransportRouteParkingDTO;
    readonly vehicle: ITransportRouteVehicleDTO;
    readonly destination: {
        readonly latitude: number;
        readonly longitude: number;
    } | null;
    readonly centers: ITransportRouteCenterDTO[];
    readonly config: {
        readonly stop: number;
        readonly percent: number;
    };
}

export interface ITransportRouteDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly description: string;
    readonly count: {
        readonly passenger: number;
        readonly location: number;
        readonly center: number;
        readonly path: number;
    };
    readonly destination: {
        readonly latitude: number;
        readonly longitude: number;
    };
    readonly paths: ITransportRoutePathDTO[];
    readonly centers: ITransportRouteCenterDTO[];
    readonly final: boolean;
    readonly key: string;
}

export interface ITransportRouteListDTO
    extends Pick<ITransportRouteDTO, 'id' | 'date' | 'title' | 'description' | 'count' | 'final' | 'key'> {
    readonly emptyCenter: number;
}
