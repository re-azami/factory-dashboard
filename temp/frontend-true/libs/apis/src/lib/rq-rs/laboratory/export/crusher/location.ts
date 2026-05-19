import { ExportType, LaboratoryCrusher, LaboratoryLine, LaboratoryResult } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface ILaboratoryExportCrusherLocationRq {
    readonly from: Date;
    readonly to: Date;
    readonly crusher: LaboratoryCrusher;
    readonly test: LaboratoryResult;
    readonly line: LaboratoryLine | null;
    readonly type: ExportType;
}

export interface ILaboratoryExportCrusherLocationRs extends IExportDTO {}
