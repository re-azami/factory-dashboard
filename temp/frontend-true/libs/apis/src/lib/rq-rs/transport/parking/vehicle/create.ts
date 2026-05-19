import { TransportVehicle } from '@lib/shared';

import { ITransportParkingDTO } from '../../../../dtos';

export interface ITransportParkingVehicleCreateRq {
    readonly type: TransportVehicle;
    readonly title: string;
    readonly capacity: number;
}

export interface ITransportParkingVehicleCreateRs extends ITransportParkingDTO {}
