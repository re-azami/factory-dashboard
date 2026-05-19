import { TransportVehicle } from '@lib/shared';

import { ITransportParkingDTO } from '../../../../dtos';

export interface ITransportParkingVehicleUpdateRq {
    readonly type: TransportVehicle;
    readonly title: string;
    readonly capacity: number;
}

export interface ITransportParkingVehicleUpdateRs extends ITransportParkingDTO {}
