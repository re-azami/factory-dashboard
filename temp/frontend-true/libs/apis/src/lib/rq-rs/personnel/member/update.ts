import { PersonnelGender, PersonnelMarital } from '@lib/shared';

import { IPersonnelMemberDTO } from '../../../dtos';

export interface IPersonnelMemberUpdateRq {
    readonly name: { readonly first: string; readonly last: string };
    readonly nationalCode: string;
    readonly mobile: string;
    readonly gender: PersonnelGender;
    readonly birthCertificate: string;
    readonly birthDate: Date;
    readonly father: string;
    readonly birthCertificateIssue: string;
    readonly residence: string;
    readonly marital: PersonnelMarital;
    readonly children: number;
    readonly children18: number;
}

export interface IPersonnelMemberUpdateRs extends IPersonnelMemberDTO {}
