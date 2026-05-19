import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface ILoadExportGroupRq {
    readonly cargo: string;
    readonly group: string;
    readonly type: ExportType;
}

export interface ILoadExportGroupRs extends IExportDTO {}
