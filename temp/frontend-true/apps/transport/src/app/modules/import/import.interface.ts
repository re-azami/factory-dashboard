import { TransportPassenger } from '@lib/shared';

export interface IImportPassenger {
    line: number;
    content: string;
    errors: string[];

    latitude: number;
    longitude: number;
    passenger: string;
    code: string;
    type: TransportPassenger;
}

export interface IImportLocation {
    latitude: number;
    longitude: number;
    passengers: { name: string; code: string; type: TransportPassenger }[];
}
