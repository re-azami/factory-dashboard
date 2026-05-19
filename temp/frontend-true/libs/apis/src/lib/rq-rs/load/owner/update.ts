import { ILoadOwnerDTO } from '../../../dtos';

export interface ILoadOwnerUpdateRq {
    readonly name: { readonly first: string; readonly last: string };
    readonly mobile: string;
    readonly nationalCode: string;
    readonly address: string;
    readonly account: {
        readonly name: string;
        readonly sheba: string;
        readonly number: string;
        readonly card: string;
    };
}

export interface ILoadOwnerUpdateRs extends ILoadOwnerDTO {}
