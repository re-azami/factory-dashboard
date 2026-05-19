import { LoadCargo, LoadStatus } from '@lib/shared';

import { ILoadSettingDTO } from './setting';

export interface ILoadCargoDTO {
    readonly id: string;
    readonly create: Date;
    readonly type: LoadCargo;
    readonly title: string;
    readonly grade: number;
    readonly tonnage: number;
    readonly party: {
        readonly id: string;
        readonly title: string;
    };
    readonly shipment: {
        readonly id: string;
        readonly title: string;
    };
    readonly contract: string;
    readonly truck: 'ON' | 'OFF' | null;
    readonly payment: boolean;
    readonly price: number;
    readonly letter: {
        readonly path: string;
        readonly mime: string;
        readonly size: number;
    } | null;
    readonly description: string;
    readonly transporter: {
        readonly required: boolean;
        readonly transporters: {
            readonly id: string;
            readonly title: string;
        }[];
    } | null;
    readonly initial: {
        readonly count: number;
        readonly weight: number;
    } | null;
    readonly status: LoadStatus;
    readonly setting: Omit<ILoadSettingDTO, 'cargo'> | null;
    readonly deactivation: number | null;
    readonly prior: {
        readonly id: string;
        readonly title: string;
    } | null;
}

export interface ILoadCargoGroupDTO {
    readonly id: string;
    readonly title: string;
    readonly first: {
        readonly code: string;
        readonly date: Date;
    };
    readonly last: {
        readonly code: string;
        readonly date: Date;
    };
    readonly draft: {
        readonly count: number;
        readonly weight: number;
    };
    readonly description: string;
}
