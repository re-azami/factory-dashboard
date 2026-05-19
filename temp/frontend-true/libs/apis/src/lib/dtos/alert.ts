import { Alert } from '@lib/shared';

export interface IAlertDTO {
    readonly id: string;
    readonly type: Alert;
    readonly date: Date;
    readonly recipients: {
        readonly id: string;
        readonly name: string;
        readonly view: Date | null;
    }[];
    readonly alert: string;
}
