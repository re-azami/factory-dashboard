import { ILoadTruckDTO } from '../../../../dtos';

export interface ILoadTruckUpdateOwnerRq {
    readonly owner: string;
    readonly update: Date;
    readonly description: string;
}

export interface ILoadTruckUpdateOwnerRs extends ILoadTruckDTO {}
