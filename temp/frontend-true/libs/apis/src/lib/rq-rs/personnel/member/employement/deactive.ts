import { PersonnelStatus } from '@lib/shared';

import { IPersonnelMemberDTO } from '../../../../dtos';

export interface IPersonnelMemberEmployementDeactiveRq {
    readonly status: PersonnelStatus;
    readonly date: Date;
    readonly description: string;
}

export interface IPersonnelMemberEmployementDeactiveRs extends IPersonnelMemberDTO {}
