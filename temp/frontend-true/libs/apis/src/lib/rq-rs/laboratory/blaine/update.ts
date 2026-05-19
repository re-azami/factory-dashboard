import { LaboratoryLine } from '@lib/shared';

import { ILaboratoryBlaineDTO } from '../../../dtos';

export interface ILaboratoryBlaineUpdateRq {
    readonly line: LaboratoryLine;
    readonly begin: Date;
    readonly end: Date;
    readonly cargo: string;
    readonly result: number;
    readonly description: string;
}

export interface ILaboratoryBlaineUpdateRs extends ILaboratoryBlaineDTO {}
