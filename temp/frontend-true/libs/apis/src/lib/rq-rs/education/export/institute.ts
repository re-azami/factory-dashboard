import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IEducationExportInstituteRq {
    readonly type: ExportType;
}

export interface IEducationExportInstituteRs extends IExportDTO {}
