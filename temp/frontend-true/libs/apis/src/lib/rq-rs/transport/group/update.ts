import { ITransportGroupDTO } from '../../../dtos';

export interface ITransportGroupUpdateRq {
    readonly title: string;
}

export interface ITransportGroupUpdateRs extends ITransportGroupDTO {}
