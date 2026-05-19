import { LaboratoryLine } from '@lib/shared';

import { ILaboratorySolidDTO } from '../../../dtos';

export interface ILaboratorySolidCreateRq {
    readonly line: LaboratoryLine;
    readonly begin: Date;
    readonly end: Date;
    readonly cargo: string;
    readonly description: string;
}

export interface ILaboratorySolidCreateRs extends ILaboratorySolidDTO {}
