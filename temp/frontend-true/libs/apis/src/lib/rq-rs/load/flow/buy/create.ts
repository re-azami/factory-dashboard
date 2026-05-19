import { ILoadDraftBuyDTO } from '../../../../dtos';

import { ILoadFlowCreateRq } from '../create';

export interface ILoadFlowBuyCreateRq extends ILoadFlowCreateRq {
    readonly billNumber: string;
    readonly billWeight: number;
}

export interface ILoadFlowBuyCreateRs extends ILoadDraftBuyDTO {}
