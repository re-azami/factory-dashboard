import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IWarehouseExportStockRq {
    readonly type: ExportType;
}

export interface IWarehouseExportStockRs extends IExportDTO {}
