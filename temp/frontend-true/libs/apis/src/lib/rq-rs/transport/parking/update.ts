import { ITransportParkingDTO } from '../../../dtos';

export interface ITransportParkingUpdateRq {
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
}

export interface ITransportParkingUpdateRs extends ITransportParkingDTO {}
