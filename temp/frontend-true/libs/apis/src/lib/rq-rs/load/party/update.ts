import { LoadCargo } from '@lib/shared';

import { ILoadPartyDTO } from '../../../dtos';

export interface ILoadPartyUpdateRq {
    readonly title: string;
    readonly cargo: LoadCargo[];
}

export interface ILoadPartyUpdateRs extends ILoadPartyDTO {}
