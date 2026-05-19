import { ExportType, LaboratoryKhatka } from '@lib/shared';

import { IExportDTO } from '../../../../dtos';

export interface ILaboratoryExportKhatkaCargoRq {
    readonly khatka: LaboratoryKhatka;
    readonly type: ExportType;
}

export interface ILaboratoryExportKhatkaCargoRs extends IExportDTO {}
