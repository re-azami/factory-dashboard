import { App } from '@lib/shared';

export interface ISupportNotificationDTO {
    readonly id: string;
    readonly date: Date;
    readonly apps: App[];
    readonly color: string;
    readonly icon: string;
    readonly title: string;
    readonly notification: string;
    readonly expire: Date;
    readonly users: {
        readonly id: string;
        readonly name: string;
        readonly view: Date;
    }[];
}
