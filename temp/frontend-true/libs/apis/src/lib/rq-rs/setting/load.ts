import { LoadFlow } from '@lib/shared';

import { ISettingDTO } from '../../dtos';

export interface ISettingLoadRq {
    readonly report: 'CREATE' | 'FINISH';
    readonly remaining: 'KILO' | 'TON';
    readonly order: 'TITLE' | 'DATE';
    readonly site: boolean;
    readonly toolsPlate: LoadFlow[];
    readonly toolsScan: LoadFlow[];
    readonly weight: {
        readonly multiply: number;
        readonly empty: number;
        readonly full: number;
    };
    readonly update: {
        readonly cargo: 'LOAD_ROLE_TRAFFICs' | 'LOAD_ROLE_WEIGHT';
        readonly plate: 'LOAD_ROLE_TRAFFIC' | 'LOAD_ROLE_WEIGHT';
        readonly transporter: 'LOAD_ROLE_TRAFFIC' | 'LOAD_ROLE_WEIGHT';
        readonly weight: 'LOAD_ROLE_TRAFFIC' | 'LOAD_ROLE_WEIGHT';
    };
}

export interface ISettingLoadRs extends ISettingDTO {}
