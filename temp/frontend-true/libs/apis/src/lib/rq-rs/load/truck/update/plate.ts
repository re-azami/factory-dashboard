import { ILoadTruckDTO } from '../../../../dtos';

export interface ILoadTruckUpdatePlateRq {
    readonly plate: string;
    readonly update: Date | null;
    readonly description: string;
}

export interface ILoadTruckUpdatePlateRs extends ILoadTruckDTO {}
