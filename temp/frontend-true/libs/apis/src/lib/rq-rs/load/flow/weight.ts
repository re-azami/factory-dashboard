import { ILoadTruckDTO } from '../../../dtos';

export interface ILoadFlowWeightRq {
    readonly plate: string;
    readonly weight: number;
    readonly update: boolean;
}

export interface ILoadFlowWeightRs extends ILoadTruckDTO {}
