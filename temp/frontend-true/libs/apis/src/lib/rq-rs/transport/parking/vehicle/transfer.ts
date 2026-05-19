import { ITransportParkingDTO } from '../../../../dtos';

export interface ITransportParkingVehicleTransferRq {
    readonly parking: string;
}

export interface ITransportParkingVehicleTransferRs {
    readonly from: ITransportParkingDTO;
    readonly to: ITransportParkingDTO;
}
