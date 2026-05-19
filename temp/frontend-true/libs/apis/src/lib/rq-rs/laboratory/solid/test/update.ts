import { LaboratorySolid } from '@lib/shared';

import { ILaboratorySolidDTO } from '../../../../dtos';

export interface ILaboratorySolidTestUpdateRq {
    readonly test: LaboratorySolid;
    readonly container: {
        readonly weight: number;
        readonly pulp: number;
    };
    readonly oven: {
        readonly weight: number;
        readonly solid: number;
    };
    readonly density: number;
    readonly result: number;
}
export interface ILaboratorySolidTestUpdateRs extends ILaboratorySolidDTO {}
