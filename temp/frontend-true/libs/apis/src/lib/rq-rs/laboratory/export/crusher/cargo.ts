import { ExportType, LaboratoryCrusher } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface ILaboratoryExportCrusherCargoRq {
    readonly crusher: LaboratoryCrusher;
    readonly type: ExportType;
}

export interface ILaboratoryExportCrusherCargoRs extends IExportDTO {}
