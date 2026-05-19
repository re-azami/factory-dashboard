import {
    EducationDate,
    EducationEducator,
    EducationExam,
    EducationPerformance,
    EducationStatus,
    EducationStudy,
} from '@lib/shared';

export interface IEducationStudyDateDTO {
    readonly date: Date;
    readonly start: string;
    readonly end: string;
    readonly duration: number;
    readonly type: EducationDate;
    readonly location: { readonly id: string; readonly title: string };
}

export interface IEducationStudyDTO {
    readonly id: string;
    readonly date: Date;
    readonly code: string;
    readonly course: {
        readonly id: string;
        readonly title: string;
        readonly type: EducationStudy;
    };
    readonly dates: IEducationStudyDateDTO[];
    readonly duration: {
        readonly total: number;
        readonly theoretical: number;
        readonly practical: number;
    };
    readonly applicant: {
        readonly id: string;
        readonly title: string;
    };
    readonly department: {
        readonly id: string;
        readonly title: string;
    }[];
    readonly educator: {
        readonly type: EducationEducator;
        readonly id: string;
        readonly title: string;
    };
    readonly expense: {
        readonly educator: number;
        readonly extra: number;
        readonly total: number;
        readonly paid: boolean;
        readonly date: Date;
    };
    readonly participant: {
        readonly count: number;
        readonly maximum: number;
    };
    readonly exam: EducationExam[];
    readonly certificate: boolean;
    readonly description: string;
    readonly status: EducationStatus;
}

export interface IEducationStudyResultDTO
    extends Pick<IEducationStudyDTO, 'id' | 'code' | 'course' | 'dates' | 'duration' | 'exam' | 'certificate'> {
    readonly participant: {
        readonly presence: number;
        readonly performance: EducationPerformance;
        readonly score: {
            readonly practical: number;
            readonly written: number;
            readonly oral: number;
            readonly electronic: number;
        };
        readonly certificate: boolean;
    };
}
