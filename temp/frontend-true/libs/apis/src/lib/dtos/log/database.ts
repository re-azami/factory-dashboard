import { App } from '@lib/shared';

export interface ILogDatabaseDTO {
    readonly app: App;
    readonly title: string;
    readonly table: string;
    readonly data: number;
    readonly size: number;
}
