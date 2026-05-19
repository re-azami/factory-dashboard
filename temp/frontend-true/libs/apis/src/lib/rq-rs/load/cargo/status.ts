import { LoadStatus } from '@lib/shared';

import { IOkDTO } from '../../../dtos';

export interface ILoadCargoStatusRq {
    readonly status: LoadStatus;
    readonly description: string;
}

export interface ILoadCargoStatusRs extends IOkDTO {}
