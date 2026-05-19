import { ExportType, PersonnelGender, PersonnelMarital, PersonnelStatus } from '@lib/shared';

import { IExportDTO } from '../../../dtos';

export interface IPersonnelExportMemberRq {
    readonly status: PersonnelStatus;
    readonly department: string;
    readonly position: string;
    readonly gender: PersonnelGender;
    readonly marital: PersonnelMarital;
    readonly education: string;
    readonly age: { readonly minimum: number; readonly maximum: number };
    readonly children18: ExportType;
    readonly type: ExportType;
}

export interface IPersonnelExportMemberRs extends IExportDTO {}
