import { LaboratoryLine, LaboratorySolid, LoadCargo } from '@lib/shared';

import { ILaboratoryCargoPortionDTO } from './portion';

export interface ILaboratorySolidTestDTO {
    readonly test: LaboratorySolid;
    readonly container: {
        readonly weight: number;
        readonly pulp: number;
    };
    readonly oven: {
        readonly weight: number;
        readonly solid: number;
    };
    readonly density: number;
    readonly result: number;
}

export interface ILaboratorySolidDTO {
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
    readonly count: number;
    readonly tests: ILaboratorySolidTestDTO[];
}
