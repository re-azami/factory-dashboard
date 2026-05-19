export interface IUserRetrievalResendRq {
    readonly id: string;
    readonly username: string;
    readonly mobile: string;
}

export interface IUserRetrievalResendRs {
    readonly canResend: boolean;
}
