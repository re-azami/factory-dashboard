import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IEducationExportParticipantRq {
    readonly type: ExportType;
}

export interface IEducationExportParticipantRs extends IExportDTO {}
