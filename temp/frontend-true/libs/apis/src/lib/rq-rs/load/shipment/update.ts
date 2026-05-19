import { ILoadShipmentDTO } from '../../../dtos';

export interface ILoadShipmentUpdateRq {
    readonly title: string;
}

export interface ILoadShipmentUpdateRs extends ILoadShipmentDTO {}
