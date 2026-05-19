import { IOkDTO } from '../../../dtos';

export interface ILoadShipmentStatusRq {
    readonly active: boolean;
}

export interface ILoadShipmentStatusRs extends IOkDTO {}
