import { IExportDTO } from '../../../../dtos';

export interface ILoadExportProceedingsLoadRq {
    readonly date: Date;
    readonly type: 'IN' | 'OUT' | 'BOTH';
}

export interface ILoadExportProceedingsLoadRs extends IExportDTO {}
