import { ILoadMiscDTO } from '../../../dtos';

export interface ILoadMiscUpdateRq {
    readonly title: string;
    readonly unit: string;
    readonly description: string;
}

export interface ILoadMiscUpdateRs extends ILoadMiscDTO {}
