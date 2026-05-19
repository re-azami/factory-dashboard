import { LaboratoryKhatka } from '@lib/shared';

import { ILaboratoryKhatkaDTO } from '../../../../dtos';

export interface ILaboratoryKhatkaTestGrindRq {
    readonly test: LaboratoryKhatka;
    readonly grind: string;
}

export interface ILaboratoryKhatkaTestGrindRs extends ILaboratoryKhatkaDTO {}
