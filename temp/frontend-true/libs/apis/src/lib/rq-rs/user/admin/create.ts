import { App } from '@lib/shared';

import { IUserPersonDTO } from '../../../dtos';

export interface IUserAdminCreateRq {
    readonly id: string;
    readonly apps: App[];
}

export interface IUserAdminCreateRs extends IUserPersonDTO {}
