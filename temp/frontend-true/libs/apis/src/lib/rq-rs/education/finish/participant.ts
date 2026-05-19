import { EducationPerformance } from '@lib/shared';

import { IEducationParticipantDTO } from '../../../dtos';

export interface IEducationFinishParticipantRq {
    readonly participant: string;
    readonly presence: number;
    readonly performance: EducationPerformance;
    readonly score: {
        readonly practical: number;
        readonly written: number;
        readonly oral: number;
        readonly electronic: number;
    };
    readonly certificate: boolean | false;
}

export interface IEducationFinishParticipantRs extends IEducationParticipantDTO {}
