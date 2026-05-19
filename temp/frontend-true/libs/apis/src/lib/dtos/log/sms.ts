export interface ILogSmsDTO {
    readonly date: Date;
    readonly type: string;
    readonly status: 'SENT' | 'ERROR';
    readonly code: string;
    readonly from: string;
    readonly to: string;
    readonly message: string;
}
