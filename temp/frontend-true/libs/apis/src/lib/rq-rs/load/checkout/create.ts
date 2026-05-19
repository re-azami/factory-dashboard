import { ILoadCheckoutDTO } from '../../../dtos';

export interface ILoadCheckoutCreateRq {
    readonly from: Date;
    readonly to: Date;
    readonly description: string;
}

export interface ILoadCheckoutCreateRs extends ILoadCheckoutDTO {}
