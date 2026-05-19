import { IExportDTO } from '../../../../dtos';

import { ExportType } from '@lib/shared';

export interface IWarehouseExportCategoryTitleRq {
    readonly type: ExportType;
    readonly indent: number;
}

export interface IWarehouseExportCategoryTitleRs extends IExportDTO {}
