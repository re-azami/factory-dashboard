import { App } from '@lib/shared';

import { IUserPersonDTO } from '../../../dtos';

export interface IUserAdminUpdateRq {
    readonly apps: App[];
}

export interface IUserAdminUpdateRs extends IUserPersonDTO {}
