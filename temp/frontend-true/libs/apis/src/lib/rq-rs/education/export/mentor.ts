import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IEducationExportMentorRq {
    readonly type: ExportType;
}

export interface IEducationExportMentorRs extends IExportDTO {}
