import { IOkDTO } from '../../../dtos';

export interface ITransportImportSaveRq {
    readonly code: string;
    readonly group: string;
    readonly location: number;
    readonly passenger: number;
}

export interface ITransportImportSaveRs extends IOkDTO {}
