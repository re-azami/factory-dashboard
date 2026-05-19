import { IExportDTO } from '../../../dtos';

export interface ILaboratoryDailyDownloadRq {
    readonly date: Date;
}

export interface ILaboratoryDailyDownloadRs extends IExportDTO {}
