import { LaboratoryLine, LoadCargo } from '@lib/shared';

import { ILaboratoryCargoPortionDTO } from './portion';
import { ILaboratoryTestFeDTO, ILaboratoryTestFeODTO } from './test';

export interface ILaboratoryTestDavisRecoveryDTO {
    readonly empty: number | null;
    readonly dry: number | null;
    readonly count: number | null;
    readonly result: number;
}

export interface ILaboratoryDavisDTO {
    readonly id: string;
    readonly line: LaboratoryLine;
    readonly time: {
        readonly begin: Date;
        readonly end: Date;
    };
    readonly cargo: {
        readonly id: string;
        readonly title: string;
        readonly type: LoadCargo | null;
        readonly party: {
            readonly id: string;
            readonly title: string;
        } | null;
        readonly shipment: {
            readonly id: string;
            readonly title: string;
        } | null;
        readonly portions: ILaboratoryCargoPortionDTO[];
    } | null;
    readonly recovery: ILaboratoryTestDavisRecoveryDTO | null;
    readonly product: {
        readonly fe: ILaboratoryTestFeDTO | null;
        readonly feo: ILaboratoryTestFeODTO | null;
    };
    readonly tail: {
        readonly fe: ILaboratoryTestFeDTO | null;
        readonly feo: ILaboratoryTestFeODTO | null;
    };
}
