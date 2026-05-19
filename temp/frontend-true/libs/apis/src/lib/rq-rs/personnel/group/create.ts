import { PersonnelGroup } from '@lib/shared';

import { IPersonnelGroupDTO } from '../../../dtos';

export interface IPersonnelGroupCreateRq {
    readonly type: PersonnelGroup;
    readonly title: string;
}

export interface IPersonnelGroupCreateRs extends IPersonnelGroupDTO {}
