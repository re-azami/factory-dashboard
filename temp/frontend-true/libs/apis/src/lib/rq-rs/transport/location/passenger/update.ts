import { TransportPassenger } from '@lib/shared';

import { ITransportLocationDTO } from '../../../../dtos';

export interface ITransportLocationPassengerUpdateRq {
    readonly type: TransportPassenger;
    readonly code: string;
    readonly name: string;
}

export interface ITransportLocationPassengerUpdateRs extends ITransportLocationDTO {}
