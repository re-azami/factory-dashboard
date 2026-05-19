import { ExportType } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface ILaboratorySupplementaryDownloadRq {
    readonly id: string;
    readonly type: ExportType;
}

export interface ILaboratorySupplementaryDownloadRs extends IExportDTO {}
