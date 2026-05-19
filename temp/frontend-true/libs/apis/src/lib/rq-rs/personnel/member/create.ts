import { PersonnelGender, PersonnelMarital } from '@lib/shared';

import { IPersonnelMemberDTO } from '../../../dtos';

export interface IPersonnelMemberCreateRq {
    readonly name: { readonly first: string; readonly last: string };
    readonly code: string;
    readonly department: string;
    readonly position: string;
    readonly employementDate: Date;
    readonly nationalCode: string;
    readonly mobile: string;
    readonly education: string;
    readonly fieldOfStudy: string;
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

export interface IPersonnelMemberCreateRs extends IPersonnelMemberDTO {}
