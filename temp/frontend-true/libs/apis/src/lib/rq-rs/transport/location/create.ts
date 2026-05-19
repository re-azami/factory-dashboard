import { ITransportLocationDTO } from '../../../dtos';

export interface ITransportLocationCreateRq {
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
}

export interface ITransportLocationCreateRs extends ITransportLocationDTO {}
