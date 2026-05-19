import { Access, App } from '@lib/shared';

import { IUserPersonDTO } from '../../../dtos';

export interface IUserPersonAccessRq {
    readonly app: App;
    readonly access: Access[];
}

export interface IUserPersonAccessRs extends IUserPersonDTO {}
