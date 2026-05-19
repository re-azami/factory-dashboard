import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface IEducationExportCourseMentorRq {
    readonly type: ExportType;
}

export interface IEducationExportCourseMentorRs extends IExportDTO {}
