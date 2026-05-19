export interface ILoadAttachmentDTO {
    readonly id: string;
    readonly create: Date;
    readonly title: string;
    readonly code: string;
    readonly file: {
        readonly path: string;
        readonly mime: string;
        readonly size: number;
    };
    readonly description: string;
}
