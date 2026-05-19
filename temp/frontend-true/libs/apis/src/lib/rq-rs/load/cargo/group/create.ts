import { ILoadCargoGroupDTO } from '../../../../dtos';

export interface ILoadCargoGroupCreateRq {
    readonly title: string;
    readonly first: string;
    readonly last: string;
    readonly description: string;
}

export interface ILoadCargoGroupCreateRs extends ILoadCargoGroupDTO {}
