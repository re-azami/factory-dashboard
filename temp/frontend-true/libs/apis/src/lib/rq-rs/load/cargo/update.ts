import { LoadCargo } from '@lib/shared';

import { ILoadCargoDTO } from '../../../dtos';

export interface ILoadCargoUpdateRq {
    readonly type: LoadCargo;
    readonly title: string;
    readonly grade: number;
    readonly tonnage: number;
    readonly party: string;
    readonly shipment: string;
    readonly contract: string;
    readonly description: string;
    readonly transporter: { readonly active: boolean; readonly required: boolean };
    readonly transporters: string[];
}

export interface ILoadCargoUpdateRs extends ILoadCargoDTO {}
