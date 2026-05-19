import { ITransportParkingDTO } from '../../../dtos';

export interface ITransportParkingCreateRq {
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
}

export interface ITransportParkingCreateRs extends ITransportParkingDTO {}
