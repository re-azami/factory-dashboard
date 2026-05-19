import { LaboratoryCrusher } from '@lib/shared';

import { ILaboratoryCrusherDTO } from '../../../../dtos';

export interface ILaboratoryCrusherTestGrindRq {
    readonly test: LaboratoryCrusher;
    readonly grind: string;
}

export interface ILaboratoryCrusherTestGrindRs extends ILaboratoryCrusherDTO {}
