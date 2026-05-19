import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface IEducationExportStudyParticipantRq {
    readonly type: ExportType;
}

export interface IEducationExportStudyParticipantRs extends IExportDTO {}
