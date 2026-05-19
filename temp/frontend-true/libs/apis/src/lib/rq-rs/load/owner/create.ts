import { ILoadOwnerDTO, ILoadTruckDTO } from '../../../dtos';

export interface ILoadOwnerCreateRq {
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
    readonly truck: {
        readonly plate: string;
        readonly type: string;
        readonly vin: string;
        readonly driverFirstName: string;
        readonly driverLastName: string;
        readonly driverMobile: string;
        readonly driverNationalCode: string;
    } | null;
}

export interface ILoadOwnerCreateRs {
    readonly owner: ILoadOwnerDTO;
    readonly truck: ILoadTruckDTO;
}
