import { ILoadMiscDTO } from '../../../dtos';

export interface ILoadMiscCreateRq {
    readonly title: string;
    readonly unit: string;
    readonly description: string;
}

export interface ILoadMiscCreateRs extends ILoadMiscDTO {}
