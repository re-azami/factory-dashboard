import { ILoadShipmentDTO } from '../../../../dtos';

export interface ILoadReportShipmentInfoRs {
    readonly shipment: ILoadShipmentDTO;
    readonly draft: {
        readonly count: number;
        readonly weight: number;
        readonly first: Date;
        readonly last: Date;
    };
}
