import { PersonnelGroup } from '@lib/shared';

import { IPersonnelGroupDTO } from '../../../dtos';

export interface IPersonnelGroupUpdateRq {
    readonly type: PersonnelGroup;
    readonly title: string;
}

export interface IPersonnelGroupUpdateRs extends IPersonnelGroupDTO {}
