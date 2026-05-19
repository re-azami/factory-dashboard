import { App } from '@lib/shared';

export interface ILogVersionDTO {
    readonly date: Date;
    readonly user: { readonly id: string; readonly name: string };
    readonly app: 'ADMIN' | App;
    readonly version: string;
    readonly build: string;
    readonly count: number;
    readonly lastUse: Date;
}
