import { LaboratoryKhatka } from '@lib/shared';

import { ILaboratoryKhatkaDTO } from '../../../../dtos';

export interface ILaboratoryKhatkaTestMoistureRq {
    readonly test: LaboratoryKhatka;
    readonly moisture: string;
}

export interface ILaboratoryKhatkaTestMoistureRs extends ILaboratoryKhatkaDTO {}
