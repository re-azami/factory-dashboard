import { ExportType, LoadCargo } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface ILoadExportDraftRq {
    readonly from: Date;
    readonly to: Date;
    readonly parties: string[];
    readonly shipments: string[];
    readonly transporters: string[];
    readonly types: LoadCargo[];
    readonly cargos: string[];
    readonly owners: string[];
    readonly plate: string | null;
    readonly type: ExportType;
}

export interface ILoadExportDraftRs extends IExportDTO {}
