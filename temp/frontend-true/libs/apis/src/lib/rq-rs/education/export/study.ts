import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IEducationExportStudyRq {
    readonly type: ExportType;
    readonly course: string | null;
    readonly institute: string | null;
    readonly mentor: string | null;
}

export interface IEducationExportStudyRs extends IExportDTO {}
