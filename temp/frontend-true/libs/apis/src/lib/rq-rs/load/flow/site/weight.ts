import { ILoadDraftSiteDTO } from '../../../../dtos';

export interface ILoadFlowSiteWeightRq {
    readonly truck: string;
    readonly cargo: string;
    readonly empty: number;
    readonly full: number;
    readonly description: string;
}

export interface ILoadFlowSiteWeightRs extends ILoadDraftSiteDTO {}
