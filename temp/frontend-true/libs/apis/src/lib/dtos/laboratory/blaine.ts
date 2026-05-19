import { LaboratoryLine, LoadCargo } from '@lib/shared';

import { ILaboratoryCargoPortionDTO } from './portion';

export interface ILaboratoryBlaineDTO {
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
    readonly result: number;
}
