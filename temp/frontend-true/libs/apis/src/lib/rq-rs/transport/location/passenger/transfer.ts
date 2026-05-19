import { ITransportLocationDTO } from '../../../../dtos';

export interface ITransportLocationPassengerTransferRq {
    readonly location: string;
}

export interface ITransportLocationPassengerTransferRs {
    readonly from: ITransportLocationDTO;
    readonly to: ITransportLocationDTO;
}
