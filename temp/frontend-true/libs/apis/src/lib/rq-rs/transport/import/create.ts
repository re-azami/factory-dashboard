import { TransportPassenger } from '@lib/shared';

import { ITransportLocationDTO } from '../../../dtos';

export interface ITransportImportCreateRq {
    readonly code: string;
    readonly group: string;
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly passengers: {
        readonly type: TransportPassenger;
        readonly code: string;
        readonly name: string;
    }[];
}

export interface ITransportImportCreateRs extends ITransportLocationDTO {}
