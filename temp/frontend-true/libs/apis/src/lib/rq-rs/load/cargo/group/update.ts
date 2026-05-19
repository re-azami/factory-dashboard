import { ILoadCargoGroupDTO } from '../../../../dtos';

export interface ILoadCargoGroupUpdateRq {
    readonly title: string;
    readonly first: string;
    readonly last: string;
    readonly description: string;
}

export interface ILoadCargoGroupUpdateRs extends ILoadCargoGroupDTO {}
