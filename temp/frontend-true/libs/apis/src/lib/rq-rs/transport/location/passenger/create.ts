import { TransportPassenger } from '@lib/shared';

import { ITransportLocationDTO } from '../../../../dtos';

export interface ITransportLocationPassengerCreateRq {
    readonly type: TransportPassenger;
    readonly code: string;
    readonly name: string;
}

export interface ITransportLocationPassengerCreateRs extends ITransportLocationDTO {}
