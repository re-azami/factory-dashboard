import { ILoadShipmentDTO } from '../../../dtos';

export interface ILoadShipmentCreateRq {
    readonly title: string;
}

export interface ILoadShipmentCreateRs extends ILoadShipmentDTO {}
