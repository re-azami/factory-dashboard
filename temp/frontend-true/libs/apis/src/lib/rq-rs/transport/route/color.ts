import { ITransportRouteDTO } from '../../../dtos';

export interface ITransportRouteColorRq {
    readonly colors: string[];
}

export interface ITransportRouteColorRs extends ITransportRouteDTO {}
