import { ILoadTruckDTO } from '../../../../dtos';

export interface ILoadTruckUpdateDriverRq {
    readonly name: { readonly first: string; readonly last: string };
    readonly mobile: string;
    readonly nationalCode: string;
    readonly update: Date;
    readonly description: string;
}

export interface ILoadTruckUpdateDriverRs extends ILoadTruckDTO {}
