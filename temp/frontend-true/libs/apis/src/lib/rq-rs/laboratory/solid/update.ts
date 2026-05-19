import { LaboratoryLine } from '@lib/shared';

import { ILaboratorySolidDTO } from '../../../dtos';

export interface ILaboratorySolidUpdateRq {
    readonly line: LaboratoryLine;
    readonly begin: Date;
    readonly end: Date;
    readonly cargo: string;
    readonly description: string;
}

export interface ILaboratorySolidUpdateRs extends ILaboratorySolidDTO {}
