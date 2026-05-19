import { LaboratoryKhatka, LaboratoryLine, LoadCargo } from '@lib/shared';

import { ILaboratoryCargoPortionDTO } from './portion';
import {
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
} from './test';

export interface ILaboratoryKhatkaTestDTO {
    readonly test: LaboratoryKhatka;
    readonly fe: ILaboratoryTestFeDTO | null;
    readonly feo: ILaboratoryTestFeODTO | null;
    readonly grind: ILaboratoryTestGrindDTO | null;
    readonly moisture: ILaboratoryTestMoistureDTO | null;
    readonly sulphur: ILaboratoryTestSulphurDTO | null;
}

export interface ILaboratoryKhatkaDTO {
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
    readonly tonnage: {
        readonly feed: number;
        readonly product: number;
    };
    readonly count: number;
    readonly tests: ILaboratoryKhatkaTestDTO[];
}

export interface ILaboratoryKhatkaCargoDTO {
    readonly id: string;
    readonly date: {
        readonly from: Date;
        readonly to: Date;
        readonly test: number;
    };
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
}
