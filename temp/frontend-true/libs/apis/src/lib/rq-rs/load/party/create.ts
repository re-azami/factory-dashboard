import { LoadCargo } from '@lib/shared';

import { ILoadPartyDTO } from '../../../dtos';

export interface ILoadPartyCreateRq {
    readonly title: string;
    readonly cargo: LoadCargo[];
}

export interface ILoadPartyCreateRs extends ILoadPartyDTO {}
