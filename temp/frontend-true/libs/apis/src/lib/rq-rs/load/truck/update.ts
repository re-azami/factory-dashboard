import { ILoadTruckDTO } from '../../../dtos';

export interface ILoadTruckUpdateRq {
    readonly type: string;
    readonly vin: string;
}

export interface ILoadTruckUpdateRs extends ILoadTruckDTO {}
