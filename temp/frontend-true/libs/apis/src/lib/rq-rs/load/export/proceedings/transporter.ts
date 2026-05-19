import { IExportDTO } from '../../../../dtos';

export interface ILoadExportProceedingsTransporterRq {
    readonly date: Date;
    readonly transporters: string[];
}

export interface ILoadExportProceedingsTransporterRs extends IExportDTO {}
