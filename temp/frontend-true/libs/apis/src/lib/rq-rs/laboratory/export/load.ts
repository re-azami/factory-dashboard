import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface ILaboratoryExportLoadRq {
    readonly from: Date;
    readonly to: Date;
    readonly type: ExportType;
}

export interface ILaboratoryExportLoadRs extends IExportDTO {}
