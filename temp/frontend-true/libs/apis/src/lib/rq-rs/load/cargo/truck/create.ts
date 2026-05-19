import { ILoadTruckDTO } from '../../../../dtos';

export interface ILoadCargoTruckCreateRq {
    readonly plate: string;
}

export interface ILoadCargoTruckCreateRs extends ILoadTruckDTO {}
