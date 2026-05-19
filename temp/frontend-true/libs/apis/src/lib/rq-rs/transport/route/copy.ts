import { ITransportRouteDTO } from '../../../dtos';

export interface ITransportRouteCopyRq {
    readonly title: string;
    readonly description: string;
}

export interface ITransportRouteCopyRs extends ITransportRouteDTO {}
