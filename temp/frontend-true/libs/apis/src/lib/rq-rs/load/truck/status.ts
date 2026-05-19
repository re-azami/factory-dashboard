import { IOkDTO } from '../../../dtos';

export interface ILoadTruckStatusRq {
    readonly active: boolean;
}

export interface ILoadTruckStatusRs extends IOkDTO {}
