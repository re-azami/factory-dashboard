import { ITransportGroupDTO } from '../../../dtos';

export interface ITransportGroupCreateRq {
    readonly title: string;
}

export interface ITransportGroupCreateRs extends ITransportGroupDTO {}
