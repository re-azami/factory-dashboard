import { ITransportRouteDTO } from '../../../dtos';

export interface ITransportRouteUpdateRq {
    readonly title: string;
    readonly description: string;
}

export interface ITransportRouteUpdateRs extends ITransportRouteDTO {}
