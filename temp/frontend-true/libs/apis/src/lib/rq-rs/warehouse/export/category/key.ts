import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface IWarehouseExportCategoryKeyRq {
    readonly type: ExportType;
    readonly indent: number;
}

export interface IWarehouseExportCategoryKeyRs extends IExportDTO {}
