import { LaboratoryKhatka } from '@lib/shared';

import { ILaboratoryKhatkaDTO } from '../../../../dtos';

export interface ILaboratoryKhatkaTestFeRq {
    readonly test: LaboratoryKhatka;
    readonly fe: string;
}

export interface ILaboratoryKhatkaTestFeRs extends ILaboratoryKhatkaDTO {}
