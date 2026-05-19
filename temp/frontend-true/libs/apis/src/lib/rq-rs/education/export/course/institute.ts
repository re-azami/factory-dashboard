import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface IEducationExportCourseInstituteRq {
    readonly type: ExportType;
}

export interface IEducationExportCourseInstituteRs extends IExportDTO {}
