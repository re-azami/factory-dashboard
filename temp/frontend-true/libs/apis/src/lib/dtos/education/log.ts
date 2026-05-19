import { EducationLog } from '@lib/shared';

export interface IEducationLogDTO {
    readonly log: EducationLog;
    readonly date: Date;
    readonly user: {
        readonly id: string;
        readonly name: string;
    };
    readonly info: any[];
    readonly description: string;
}
