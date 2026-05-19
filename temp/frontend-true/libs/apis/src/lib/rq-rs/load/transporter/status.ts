import { IOkDTO } from '../../../dtos';

export interface ILoadTransporterStatusRq {
    readonly active: boolean;
}

export interface ILoadTransporterStatusRs extends IOkDTO {}
