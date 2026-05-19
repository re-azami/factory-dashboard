import { LoadCargo } from '@lib/shared';

import {
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
} from './test';

export interface ILaboratoryLoadDTO {
    readonly id: string;
    readonly date: Date;
    readonly cargo: {
        readonly id: string;
        readonly title: string;
        readonly type: LoadCargo;
        readonly party: {
            readonly id: string;
            readonly title: string;
        } | null;
        readonly shipment: {
            readonly id: string;
            readonly title: string;
        } | null;
    };
    readonly draft: {
        readonly count: number;
        readonly weight: number;
    };
    readonly fe: ILaboratoryTestFeDTO;
    readonly feo: ILaboratoryTestFeODTO;
    readonly grind: ILaboratoryTestGrindDTO;
    readonly moisture: ILaboratoryTestMoistureDTO;
    readonly sulphur: ILaboratoryTestSulphurDTO;
}

export interface ILaboratoryLoadCargoDTO {
    readonly id: string;
    readonly date: {
        readonly from: Date;
        readonly to: Date;
        readonly day: number;
    };
    readonly title: string;
    readonly type: LoadCargo;
    readonly party: {
        readonly id: string;
        readonly title: string;
    };
    readonly shipment: {
        readonly id: string;
        readonly title: string;
    };
    readonly draft: {
        readonly count: number;
        readonly weight: number;
    };
}
