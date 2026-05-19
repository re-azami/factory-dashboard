import { IOkDTO } from '../../../dtos';

export interface ITransportLocationStatusRq {
    readonly active: boolean;
}

export interface ITransportLocationStatusRs extends IOkDTO {}
