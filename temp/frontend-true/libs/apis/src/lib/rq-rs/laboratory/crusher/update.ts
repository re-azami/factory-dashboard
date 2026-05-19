import { LaboratoryLine } from '@lib/shared';

import { ILaboratoryCrusherDTO } from '../../../dtos';

export interface ILaboratoryCrusherUpdateRq {
    readonly line: LaboratoryLine;
    readonly begin: Date;
    readonly end: Date;
    readonly cargo: string | null;
    readonly tonnage: {
        readonly feed: number | null;
        readonly product: number | null;
        readonly gauss1200: number | null;
        readonly gauss2000: number | null;
        readonly tail: number | null;
    };
    readonly description: string;
}

export interface ILaboratoryCrusherUpdateRs extends ILaboratoryCrusherDTO {}
