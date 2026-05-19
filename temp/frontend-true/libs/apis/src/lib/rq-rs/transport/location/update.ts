import { ITransportLocationDTO } from '../../../dtos';

export interface ITransportLocationUpdateRq {
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
}

export interface ITransportLocationUpdateRs extends ITransportLocationDTO {}
