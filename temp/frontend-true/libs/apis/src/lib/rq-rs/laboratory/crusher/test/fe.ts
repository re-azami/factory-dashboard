import { LaboratoryCrusher } from '@lib/shared';

import { ILaboratoryCrusherDTO } from '../../../../dtos';

export interface ILaboratoryCrusherTestFeRq {
    readonly test: LaboratoryCrusher;
    readonly fe: string;
}

export interface ILaboratoryCrusherTestFeRs extends ILaboratoryCrusherDTO {}
