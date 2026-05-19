import { ILoadCargoDTO } from '../../../../dtos';

export interface ILoadCargoUpdatePaymentRq {
    readonly truck: 'ON' | 'OFF' | null;
    readonly payment: boolean;
    readonly price: number | null;
    readonly update: Date | null;
    readonly description: string;
}

export interface ILoadCargoUpdatePaymentRs extends ILoadCargoDTO {}
