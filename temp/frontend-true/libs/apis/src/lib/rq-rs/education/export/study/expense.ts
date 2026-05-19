import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface IEducationExportStudyExpenseRq {
    readonly type: ExportType;
}

export interface IEducationExportStudyExpenseRs extends IExportDTO {}
