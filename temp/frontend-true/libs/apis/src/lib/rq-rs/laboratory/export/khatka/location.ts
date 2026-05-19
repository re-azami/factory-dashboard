import { ExportType, LaboratoryKhatka, LaboratoryLine, LaboratoryResult } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface ILaboratoryExportKhatkaLocationRq {
    readonly from: Date;
    readonly to: Date;
    readonly khatka: LaboratoryKhatka;
    readonly test: LaboratoryResult;
    readonly line: LaboratoryLine | null;
    readonly type: ExportType;
}

export interface ILaboratoryExportKhatkaLocationRs extends IExportDTO {}
