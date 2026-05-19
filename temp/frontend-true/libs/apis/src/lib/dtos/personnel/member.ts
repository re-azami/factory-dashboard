import { PersonnelGender, PersonnelLocation, PersonnelMarital, PersonnelStatus } from '@lib/shared';

export interface IPersonnelMemberEmployementLogDTO {
    readonly id: string;
    readonly status: PersonnelStatus;
    readonly date: Date;
    readonly description: string;
}

export interface IPersonnelMemberDTO {
    readonly id: string;
    readonly date: Date;
    readonly name: { readonly first: string; readonly last: string };
    readonly code: string;
    readonly department: { readonly id: string; readonly title: string };
    readonly position: { readonly id: string; readonly title: string };
    readonly nationalCode: string;
    readonly mobile: string;
    readonly education: { readonly id: string; readonly title: string };
    readonly fieldOfStudy: string;
    readonly gender: PersonnelGender;
    readonly birthCertificate: string;
    readonly birthDate: Date;
    readonly age: number;
    readonly father: string;
    readonly birthCertificateIssue: string;
    readonly residence: string;
    readonly marital: PersonnelMarital;
    readonly children: number;
    readonly children18: number;
    readonly image: string;
    readonly employement: {
        readonly status: PersonnelStatus;
        readonly date: Date;
        readonly month: number;
        readonly logs: IPersonnelMemberEmployementLogDTO[];
    };
}

export interface IPersonnelMemberLocationDTO extends Pick<IPersonnelMemberDTO, 'id' | 'name' | 'code' | 'gender'> {
    readonly location: {
        readonly status: PersonnelLocation;
        readonly transport: boolean;
        readonly latitude: number;
        readonly longitude: number;
    } | null;
}
