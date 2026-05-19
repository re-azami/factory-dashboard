import { IOkDTO } from '../../../dtos';

export interface ILoadFlowBulkCancelRq {
    readonly drafts: string[];
    readonly description: string;
}

export interface ILoadFlowBulkCancelRs extends IOkDTO {}
