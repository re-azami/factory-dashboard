import { LaboratoryKhatka } from '@lib/shared';

import { ILaboratoryKhatkaDTO } from '../../../../dtos';

export interface ILaboratoryKhatkaTestSulphurRq {
    readonly test: LaboratoryKhatka;
    readonly sulphur: string;
}

export interface ILaboratoryKhatkaTestSulphurRs extends ILaboratoryKhatkaDTO {}
