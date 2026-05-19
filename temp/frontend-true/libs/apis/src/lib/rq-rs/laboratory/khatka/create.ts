import { LaboratoryLine } from '@lib/shared';

import { ILaboratoryKhatkaDTO } from '../../../dtos';

export interface ILaboratoryKhatkaCreateRq {
    readonly line: LaboratoryLine;
    readonly begin: Date;
    readonly end: Date;
    readonly cargo: string | null;
    readonly tonnage: {
        readonly feed: number | null;
        readonly product: number | null;
    };
    readonly description: string;
}

export interface ILaboratoryKhatkaCreateRs extends ILaboratoryKhatkaDTO {}
