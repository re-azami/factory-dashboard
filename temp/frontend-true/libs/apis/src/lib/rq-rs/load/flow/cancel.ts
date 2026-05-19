import { IOkDTO } from '../../../dtos';

export interface ILoadFlowCancelRq {
    readonly description: string;
}

export interface ILoadFlowCancelRs extends IOkDTO {}
