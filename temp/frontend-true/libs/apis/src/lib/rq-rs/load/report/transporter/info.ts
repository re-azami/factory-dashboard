import { ILoadTransporterDTO } from '../../../../dtos';

export interface ILoadReportTransporterInfoRs {
    readonly transporter: ILoadTransporterDTO;
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
}
