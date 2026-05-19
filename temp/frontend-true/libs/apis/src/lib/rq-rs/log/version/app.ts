export interface ILogVersionAppUserDTO {
    readonly user: { readonly id: string; readonly name: string };
    readonly version: string;
    readonly count: number;
    readonly lastUse: Date;
}
export interface ILogVersionAppRs {
    readonly version: {
        readonly date: Date;
        readonly version: string;
        readonly build: string;
    };
    readonly users: ILogVersionAppUserDTO[];
}
