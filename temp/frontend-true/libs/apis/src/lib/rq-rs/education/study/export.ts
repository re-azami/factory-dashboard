import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IEducationStudyExportRq {
    readonly type: ExportType;
}

export interface IEducationStudyExportRs extends IExportDTO {}
