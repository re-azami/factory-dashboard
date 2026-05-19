import { IPersonnelMemberLocationDTO } from '../../../dtos';

import { PersonnelLocation } from '@lib/shared';

export interface IPersonnelLocationCreateRq {
    readonly status: PersonnelLocation;
    readonly transport: boolean;
    readonly latitude: number;
    readonly longitude: number;
}

export interface IPersonnelLocationCreateRs extends IPersonnelMemberLocationDTO {}
