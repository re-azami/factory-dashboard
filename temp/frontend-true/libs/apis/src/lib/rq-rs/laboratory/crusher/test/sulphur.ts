import { LaboratoryCrusher } from '@lib/shared';

import { ILaboratoryCrusherDTO } from '../../../../dtos';

export interface ILaboratoryCrusherTestSulphurRq {
    readonly test: LaboratoryCrusher;
    readonly sulphur: string;
}

export interface ILaboratoryCrusherTestSulphurRs extends ILaboratoryCrusherDTO {}
