import { LaboratoryCrusher } from '@lib/shared';

import { ILaboratoryCrusherDTO } from '../../../../dtos';

export interface ILaboratoryCrusherTestMoistureRq {
    readonly test: LaboratoryCrusher;
    readonly moisture: string;
}

export interface ILaboratoryCrusherTestMoistureRs extends ILaboratoryCrusherDTO {}
