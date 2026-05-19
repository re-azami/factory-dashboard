import { ILoadDraftOutDTO } from '../../../../dtos';

import { ILoadFlowCreateRq } from '../create';

export interface ILoadFlowOutCreateRq extends ILoadFlowCreateRq {
    readonly bitaDraft: string;
}

export interface ILoadFlowOutCreateRs extends ILoadDraftOutDTO {}
