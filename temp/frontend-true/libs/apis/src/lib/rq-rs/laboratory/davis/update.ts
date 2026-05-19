import { LaboratoryLine } from '@lib/shared';

import { ILaboratoryDavisDTO } from '../../../dtos';

export interface ILaboratoryDavisUpdateRq {
    readonly line: LaboratoryLine;
    readonly begin: Date;
    readonly end: Date;
    readonly cargo: string;
    readonly recovery: string | null;
    readonly productFe: string | null;
    readonly productFeo: string | null;
    readonly tailFe: string | null;
    readonly tailFeo: string | null;
    readonly description: string;
}

export interface ILaboratoryDavisUpdateRs extends ILaboratoryDavisDTO {}
