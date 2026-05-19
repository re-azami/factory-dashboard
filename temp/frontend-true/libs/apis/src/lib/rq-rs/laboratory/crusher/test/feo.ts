import { LaboratoryCrusher } from '@lib/shared';

import { ILaboratoryCrusherDTO } from '../../../../dtos';

export interface ILaboratoryCrusherTestFeORq {
    readonly test: LaboratoryCrusher;
    readonly feo: string;
}

export interface ILaboratoryCrusherTestFeORs extends ILaboratoryCrusherDTO {}
