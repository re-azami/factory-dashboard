import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface ILoadCheckoutDownloadRq {
    readonly cargo: string[];
    readonly type: ExportType;
}

export interface ILoadCheckoutDownloadRs extends IExportDTO {}
