import { ILoadCargoDTO } from '../../../dtos';

export interface ILoadReportActiveDTO {
    readonly cargo: ILoadCargoDTO;
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly remaining: number;
    };
}

export interface ILoadReportActiveRs extends Array<ILoadReportActiveDTO> {}
