import { PersonnelStatus } from '@lib/shared';

import { IPersonnelMemberDTO } from '../../../../dtos';

export interface IPersonnelMemberEmployementActiveRq {
    readonly date: Date;
    readonly description: string;
}

export interface IPersonnelMemberEmployementActiveRs extends IPersonnelMemberDTO {}
