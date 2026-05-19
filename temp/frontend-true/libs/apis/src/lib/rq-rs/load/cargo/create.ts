import { LoadCargo, LoadStatus } from '@lib/shared';

import { ILoadCargoDTO } from '../../../dtos';

export interface ILoadCargoCreateRq {
    readonly type: LoadCargo;
    readonly title: string;
    readonly grade: number;
    readonly tonnage: number;
    readonly party: string;
    readonly shipment: string;
    readonly contract: string;
    readonly truck: 'ON' | 'OFF' | null;
    readonly payment: boolean;
    readonly price: number | null;
    readonly letter: {
        readonly path: string;
        readonly mime: string;
        readonly size: number;
    } | null;
    readonly description: string;
    readonly status: LoadStatus;
    readonly transporter: {
        readonly active: boolean;
        readonly required: boolean;
    };
    readonly transporters: string[];
}

export interface ILoadCargoCreateRs extends ILoadCargoDTO {}
