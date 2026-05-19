import { App } from '@lib/shared';

export interface ILogExceptionDTO {
    readonly date: Date;
    readonly user: { readonly id: string; readonly name: string };
    readonly app: App;
    readonly status: number;
    readonly message: string[];
    readonly method: string;
    readonly path: string;
    readonly duration: number;
}
