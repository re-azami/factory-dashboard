import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IEducationExportPersonnelRq {
    readonly type: ExportType;
}

export interface IEducationExportPersonnelRs extends IExportDTO {}
