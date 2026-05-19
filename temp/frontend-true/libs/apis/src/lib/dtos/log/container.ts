export interface ILogContainerDTO {
    readonly date: Date;
    readonly containers: {
        readonly name: string;
        readonly image: string;
        readonly date: Date;
        readonly status: string;
    }[];
}
