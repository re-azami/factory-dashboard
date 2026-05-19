import { IOkDTO } from '../../../dtos';

export interface ITransportParkingStatusRq {
    readonly active: boolean;
}

export interface ITransportParkingStatusRs extends IOkDTO {}
