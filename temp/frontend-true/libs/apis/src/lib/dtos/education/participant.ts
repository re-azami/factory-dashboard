import { EducationPerformance } from '@lib/shared';

export interface IEducationParticipantDTO {
    readonly id: string;
    readonly name: string;
    readonly code: string;
    readonly department: { readonly id: string; readonly title: string };
    readonly position: { readonly id: string; readonly title: string };
    readonly presence: number;
    readonly performance: EducationPerformance;
    readonly score: {
        readonly practical: number;
        readonly written: number;
        readonly oral: number;
        readonly electronic: number;
    };
    readonly certificate: boolean;
}
