import { ILoadCheckoutDTO } from '../../../dtos';

export interface ILoadCheckoutPaymentRq {
    readonly date: Date;
    readonly description: string;
}

export interface ILoadCheckoutPaymentRs extends ILoadCheckoutDTO {}
