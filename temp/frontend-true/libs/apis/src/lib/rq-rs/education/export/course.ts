import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IEducationExportCourseRq {
    readonly type: ExportType;
}

export interface IEducationExportCourseRs extends IExportDTO {}
