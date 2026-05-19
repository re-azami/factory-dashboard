import { LaboratoryKhatka } from '@lib/shared';

import { ILaboratoryKhatkaDTO } from '../../../../dtos';

export interface ILaboratoryKhatkaTestFeORq {
    readonly test: LaboratoryKhatka;
    readonly feo: string;
}

export interface ILaboratoryKhatkaTestFeORs extends ILaboratoryKhatkaDTO {}
