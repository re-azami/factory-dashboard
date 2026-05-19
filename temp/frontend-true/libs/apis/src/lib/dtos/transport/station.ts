import { TransportPassenger } from '@lib/shared';

export interface ITransportStationPassengerDTO {
    readonly id: string;
    readonly type: TransportPassenger;
    readonly code: string | null;
    readonly name: string;
}

export interface ITransportStationLocationDTO {
    readonly id: string;
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly passengers: ITransportStationPassengerDTO[];
    readonly time: number;
    readonly distance: number;
}

export interface ITransportStationCenterDTO {
    readonly color: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly locations: ITransportStationLocationDTO[];
}

export interface ITransportStationDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly description: string;
    readonly count: {
        readonly passenger: number;
        readonly location: number;
        readonly center: number;
    };
    readonly centers: ITransportStationCenterDTO[];
}

export interface ITransportStationListDTO
    extends Pick<ITransportStationDTO, 'id' | 'date' | 'title' | 'description' | 'count'> {}
