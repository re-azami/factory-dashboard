import { PersonnelLog } from '@lib/shared';

export interface IPersonnelLogDTO {
    readonly log: PersonnelLog;
    readonly date: Date;
    readonly user: {
        readonly id: string;
        readonly name: string;
    };
    readonly info: any[];
    readonly description: string;
}
