import { ILoadTruckDTO } from '../../../dtos';

export interface ILoadTruckCreateRq {
    readonly owner: string;
    readonly plate: string;
    readonly type: string;
    readonly vin: string;
    readonly driverName: { readonly first: string; readonly last: string };
    readonly driverMobile: string;
    readonly driverNationalCode: string;
}

export interface ILoadTruckCreateRs extends ILoadTruckDTO {}
