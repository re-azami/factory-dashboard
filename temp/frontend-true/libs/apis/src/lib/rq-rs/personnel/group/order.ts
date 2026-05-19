import { PersonnelGroup } from '@lib/shared';

import { IOkDTO } from '../../../dtos';

export interface IPersonnelGroupOrderRq {
    readonly type: PersonnelGroup;
    readonly groups: string[];
}

export interface IPersonnelGroupOrderRs extends IOkDTO {}
