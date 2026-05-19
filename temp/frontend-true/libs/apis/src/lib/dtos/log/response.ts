import { App } from '@lib/shared';

export interface ILogResponseDTO {
    readonly date: Date;
    readonly user: { readonly id: string; readonly name: string };
    readonly app: App;
    readonly method: string;
    readonly path: string;
    readonly duration: number;
}
