import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IWarehouseExportCategoryRq {
    readonly type: ExportType;
    readonly category: string;
}

export interface IWarehouseExportCategoryRs extends IExportDTO {}
